import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isValidEmail } from "@/lib/validate-email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const CAP = 20;

export async function POST(req: NextRequest) {
  const { tokenId, name, email, phone, telegram, github } = await req.json();

  if (!tokenId || !name || !email) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  /* server-side email validation: format + MX */
  if (!(await isValidEmail(email))) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  /* check cap */
  const { count: usedCount } = await supabase
    .from("impossibl_tokens")
    .select("*", { count: "exact", head: true })
    .eq("used", true);

  /* cap reached — save to waitlist instead */
  if ((usedCount ?? 0) >= CAP) {
    await supabase.from("impossibl_waitlist").insert({
      email,
      name,
      telegram: telegram || null,
      github: github || null,
    });
    return NextResponse.json({ waitlisted: true });
  }

  /* atomic: mark token as used + assign builder number */
  const builderNumber = (usedCount ?? 0) + 1;

  const { error: tokenErr } = await supabase
    .from("impossibl_tokens")
    .update({ used: true, builder_number: builderNumber })
    .eq("id", tokenId)
    .eq("used", false);

  if (tokenErr) {
    return NextResponse.json({ error: "token claim failed" }, { status: 409 });
  }

  /* check email uniqueness */
  const { count: emailCount } = await supabase
    .from("impossibl_builders")
    .select("*", { count: "exact", head: true })
    .eq("email", email);

  if ((emailCount ?? 0) > 0) {
    return NextResponse.json({ error: "email taken" }, { status: 409 });
  }

  /* create builder row */
  const { error: builderErr } = await supabase.from("impossibl_builders").insert({
    name,
    email,
    telegram: telegram || null,
    github: github || null,
    builder_number: builderNumber,
    token_id: tokenId,
  });

  if (builderErr) {
    console.error("builder insert failed:", builderErr);
    return NextResponse.json({ error: "builder creation failed" }, { status: 500 });
  }

  /* send confirmation email */
  await resend.emails.send({
    from: "impossibl <noreply@mail.impossibl.com>",
    to: email,
    subject: `impossibl[0][${builderNumber}]`,
    html: `
      <div style="background:#000;color:#fff;font-family:monospace;padding:40px;line-height:1.8;font-size:13px">
        <p style="color:#fff">impossibl[0][${builderNumber}].</p>
        <p style="margin-top:20px;color:#aaa">congratulations.</p>
        <p style="margin-top:16px;color:#888">out of hundreds who tried, you're one of<br>the few who made it through.</p>
        <p style="margin-top:16px;color:#aaa">welcome to impossibl[0].</p>
        <p style="margin-top:16px;color:#888">one day. one house. one goal.<br>to ship what others think cannot be built.</p>
        <p style="margin-top:16px;color:#888">you're about to join a group of the sharpest<br>engineers in the world. every one of them<br>proved it. no one was invited. everyone earned it.</p>
        <p style="margin-top:20px;color:#888">now you might be wondering who we are.</p>
        <p style="margin-top:16px;color:#888">we are not a hacker group. we are not a club.<br>we don't have a logo. we don't recruit.</p>
        <p style="margin-top:16px;color:#888">we are a group of individuals drawn together<br>by a single conviction: that better explanations<br>are the engine of all progress. and that those<br>who create them should be empowered,<br>not suppressed.</p>
        <p style="margin-top:20px;color:#aaa">now, the rules.</p>
        <p style="margin-top:16px;color:#888">you may see undisclosed, non-public and<br>proprietary technology at the event.<br>be discreet.</p>
        <p style="margin-top:16px;color:#888">all impossibl communications are private<br>and should remain so.</p>
        <p style="margin-top:16px;color:#888">do not share anything publicly.<br>do not take pictures.<br>do not ever talk about impossibl.<br>do not mention the location.<br>do not mention the attendees.</p>
        <p style="margin-top:16px;color:#888">some of them don't officially exist.<br>respect that.</p>
        <p style="margin-top:16px;color:#888">any violation and your access will be<br>permanently revoked.<br>we will pretend you never existed.</p>
        <p style="margin-top:20px;color:#aaa">join the channel. do not share this link.<br><a href="https://t.me/+yxI9zUYC8CMwN2Nh" style="color:#555">https://t.me/+yxI9zUYC8CMwN2Nh</a></p>
        <p style="margin-top:20px;color:#888">bring your hash to the hackathon.<br>san francisco. march 24.<br>details and location drop 48h before.</p>
        <p style="margin-top:24px;color:#555">— impossibl</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true, builderNumber });
}
