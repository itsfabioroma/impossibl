/*
 * cicada.c — Cicada 3301 wing-flap + eye-blink animation engine
 * freestanding wasm32, no libc
 *
 * The wing animation combines three effects:
 *   1. Vertical displacement (tips shift up/down several rows)
 *   2. Horizontal compression (tips fold inward toward body)
 *   3. Wave propagation (movement ripples outward from body to tips)
 *   4. Motion blur (tip chars lighten at peak velocity)
 */

#define ROWS 18
#define COLS 100
#define CENTER_COL 48
#define BODY_RADIUS 8
#define WING_ROW_END 13
#define V_AMP 6.0f
#define H_AMP 5.0f
#define WAVE_DELAY 30
#define EYE_ROW 6
#define EYE_COL 58

/* ── ascii art ──────────────────────────────────────────────────────────── */

static const char art[ROWS][COLS + 1] = {
    "        %@@%%{#@@@@@@#{{#@@%%                 %@@%%%@@                 @@@@%{%{@@@@@@@@@%%%@    ",
    "     ##@  @@    @@@@@    @@  @@@@@@         %@@@ @ @@@@#         %@@@@@@@      @@@% @@@@  @@@#  ",
    "    @@  @@@@   @@@  @@@@@@@@@@@@@@@@@@@@    @@@@@@  @       @@@@@@ @@@@ @@@@@@@@@    @@@@@@@@%   ",
    "    {[(@  @@@@@  @@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@@@@@@@@@@@ @@@@@@@@@@#@  @@{@@@@@@   ",
    "       @#@@@@@@@@@@    @@@@@@@ @@@@@@@@@@ @@@@@@    @@@@*< @@@@@@@@ [@@{@@@@  [   @@@@@@@       ",
    "           @@@@@ @@%@@@@ %@@@@@@@   {#    @@@   @@ @@@#@@  @@  %@@@@@@@@@@@@@  @%@@@@@@         ",
    "            [@@@@@ @@@@    @@ @@@%         @@@@@@@@@@%   -@:   @ @@@@@@ @@@ @@@@@ @@%           ",
    "               @@@#@%  @@@@@@@             @@@[   @@               @@@@@@@@@@@@@%                ",
    "                      @@@@ @@@@%           @@@@@% %@@  }           @@@@ @@@@@                    ",
    "                     @@@  @@@} %           @@@%@   @%              @@  @{@@@@#                   ",
    "                     %@@@@@@@               @@ @@ %@@              @@  @@@@@@                    ",
    "                       @@@@@@@% #           @@  @@ #   @@         @@@@@@@@@                      ",
    "                          %%@@%%@#{{]       @@  @@}    # {     ]#%@@@@@                          ",
    "                                            @@@ <          =                                     ",
    "                                             @@@%                                                ",
    "                                              @@                                                 ",
    "                                               @@%                                               ",
    "                                                @%                                               ",
};

/* ── state ──────────────────────────────────────────────────────────────── */

static int line_len[ROWS];
static char output[ROWS * (COLS + 1) + 1];

/* ── math ───────────────────────────────────────────────────────────────── */

static float my_fabsf(float x) { return x < 0 ? -x : x; }

static float my_sinf(float x) {
    float PI = 3.14159265f, TAU = 6.28318530f;
    while (x < 0.0f)  x += TAU;
    while (x >= TAU)   x -= TAU;
    float sign = 1.0f;
    if (x > PI) { x -= PI; sign = -1.0f; }
    float num = 16.0f * x * (PI - x);
    float den = 5.0f * PI * PI - 4.0f * x * (PI - x);
    return sign * num / den;
}

/* cosine for velocity (derivative of sin) */
static float my_cosf(float x) {
    return my_sinf(x + 1.57079632f);
}

/* ── motion blur: lighten dense chars at wing tips ──────────────────────── */

static char blur_char(char c, float intensity) {
    /* intensity 0..1: how much to lighten */
    if (intensity < 0.3f) return c;

    if (intensity < 0.6f) {
        if (c == '@') return '%';
        if (c == '#') return '+';
        if (c == '%') return '*';
        return c;
    }

    /* high blur */
    if (c == '@') return '+';
    if (c == '#') return ':';
    if (c == '%') return '.';
    if (c == '*') return '.';
    if (c == '+') return '.';
    return c;
}

/* ── exports ────────────────────────────────────────────────────────────── */

void init(void) {
    for (int r = 0; r < ROWS; r++) {
        int len = 0;
        for (int c = 0; c < COLS; c++) {
            if (art[r][c] != '\0') len = c + 1;
            else break;
        }
        line_len[r] = len;
    }
}

void get_frame(int phase_256, int blink) {
    float TAU = 6.28318530f;

    int pos = 0;
    for (int row = 0; row < ROWS; row++) {
        for (int col = 0; col < COLS; col++) {
            int dx = col > CENTER_COL ? col - CENTER_COL : CENTER_COL - col;
            int is_wing = (row < WING_ROW_END && dx > BODY_RADIUS);

            if (!is_wing) {
                /* body: copy directly */
                output[pos] = (col < line_len[row]) ? art[row][col] : ' ';
            } else {
                /* ── wing zone ─────────────────────────────── */
                float wing_dist = (float)(dx - BODY_RADIUS) / 40.0f;
                if (wing_dist > 1.0f) wing_dist = 1.0f;

                /* row factor: top rows (wing tips) move dramatically more */
                float row_frac = 1.0f - (float)row / (float)WING_ROW_END;

                /* wave propagation: tips lag behind base */
                int delayed = (phase_256 - (int)(wing_dist * WAVE_DELAY)) & 255;
                float phase = my_sinf((float)delayed * TAU / 256.0f);
                float velocity = my_fabsf(my_cosf((float)delayed * TAU / 256.0f));

                /* vertical displacement */
                int v_off = (int)(phase * wing_dist * row_frac * V_AMP);

                /* horizontal fold: tips compress toward body on upstroke */
                int h_off = 0;
                if (wing_dist > 0.2f) {
                    float h_frac = (wing_dist - 0.2f) / 0.8f;
                    h_off = (int)(phase * h_frac * row_frac * H_AMP);
                    if (col > CENTER_COL) h_off = -h_off;
                }

                int src_row = row + v_off;
                int src_col = col + h_off;

                char ch = ' ';
                if (src_row >= 0 && src_row < ROWS &&
                    src_col >= 0 && src_col < COLS &&
                    src_col < line_len[src_row]) {
                    ch = art[src_row][src_col];
                }

                /* motion blur at wing tips during fast movement */
                float blur_intensity = velocity * wing_dist * row_frac;
                if (ch != ' ') {
                    ch = blur_char(ch, blur_intensity);
                }

                output[pos] = ch;
            }

            /* eye blink */
            if (blink && row == EYE_ROW && col == EYE_COL)
                output[pos] = '-';

            pos++;
        }
        output[pos++] = '\n';
    }
    output[pos] = '\0';
}

char* get_output_ptr(void) { return output; }
int get_rows(void) { return ROWS; }
int get_cols(void) { return COLS; }
