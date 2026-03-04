"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import React, { useRef } from "react";

const Skiper28 = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // INTRO: Some nos primeiros 15%
  const introOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  // TEXTO 3D PRINCIPAL:
  const yMotionValue = useTransform(scrollYProgress, [0, 0.2, 1], [1400, 1400, -900]);
  const transform = useMotionTemplate`scale(0.8) rotateX(60deg) translateY(${yMotionValue}px)`;
  
  // Limpa o palco: Faz o texto 3D desaparecer suavemente no finalzinho (80% a 95%) 
  // para dar espaço à transição de saída.
  const mainOpacity = useTransform(scrollYProgress, [0.8, 0.95], [1, 0]);

  // OUTRO (A SAÍDA ELEGANTE):
  // Começa a aparecer em 85% do scroll (cruzando com o fim do texto 3D).
  const outroOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1]);
  // Dá um leve levante de 20px para cima enquanto aparece, chamando a próxima seção.
  const outroY = useTransform(scrollYProgress, [0.85, 1], [20, 0]); 

  return (
    <div
      ref={targetRef}
      className="relative z-0 h-[500vh] w-full bg-white text-[#1d1d1f]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-transparent">
        
        {/* LENTE ÓTICA SUPERIOR (Horizonte) */}
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 h-[30vh] w-full"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            transform: "translateZ(0)", // Otimização de GPU
          }}
        />

        {/* LENTE ÓTICA INFERIOR (Foreground) */}
        {/* hidden md:block salva a placa de vídeo do celular de dar lag */}
        <div
          className="hidden md:block pointer-events-none absolute bottom-0 left-0 z-10 h-[25vh] w-full"
          style={{
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            transform: "translateZ(0)", 
          }}
        />

        {/* 1. TEXTO DE PREPARAÇÃO (Amuse-Bouche) */}
        <motion.div 
          style={{ opacity: introOpacity }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
        >
           <span className="font-geist text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
             So here is what I did
           </span>
           <div className="mt-4 h-12 w-[1px] bg-gradient-to-b from-gray-400 to-transparent" />
        </motion.div>

        {/* 2. O PALCO 3D (O Show) */}
        <div
          className="absolute inset-0 mx-auto flex items-center justify-center px-4"
          style={{
            transformStyle: "preserve-3d",
            perspective: "400px",
            perspectiveOrigin: "50% 0%",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 75%, transparent 100%)",
            maskImage: "linear-gradient(to top, black 0%, black 75%, transparent 100%)",
          }}
        >
          <motion.div
            style={{
              transformStyle: "preserve-3d",
              transform,
              opacity: mainOpacity, // Injetamos o fade out final aqui
              transformOrigin: "top center",
              willChange: "transform, opacity",
              WebkitFontSmoothing: "antialiased",
              backfaceVisibility: "hidden",
            }}
            className="font-geist w-full max-w-2xl text-center text-3xl font-bold tracking-tighter text-[#1d1d1f] md:text-5xl lg:text-6xl"
          >
            I watched all of your podcasts. Every single one. And I got truly
            inspired by stories told there. In fact, I noticed a pattern. I
            realized that everyone you'd invited for a talk were people just like
            you. The ones building the Impossible. People that got laughed at
            their faces. That were made fun of. That bet against the
            crowd.
          </motion.div>
        </div>

        {/* 3. A SAÍDA ELEGANTE (The Outro) */}
        {/* Fica invisível e só surge no centro cruzando com o final do 3D */}
        <motion.div 
          style={{ opacity: outroOpacity, y: outroY }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
        >
           {/* Uma pequena linha que vem de cima pra dar continuidade geométrica com a introdução */}
           <div className="mb-4 h-12 w-[1px] bg-gradient-to-t from-gray-400 to-transparent" />
           <span className="font-geist text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
           And even then
           </span>
        </motion.div>

      </div>
    </div>
  );
};

export { Skiper28 };