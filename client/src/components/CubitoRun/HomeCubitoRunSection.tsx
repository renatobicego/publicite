import { CUBITO_RUN } from "@/utils/data/urls";

/**
 * Sección del juego Cubito Run en el home.
 *
 * El juego es un HTML estático en `public/cubito-run.html`.
 * - Con mouse (compu): va embebido en un iframe.
 * - Con pantalla táctil: el juego se arma a pantalla completa (100dvh y
 *   `touch-action: none`), así que embebido trabaría el scroll del home.
 *   En ese caso se muestra un botón que lo abre en su propia página.
 */
const HomeCubitoRunSection = () => {
  return (
    <section className="flex w-full flex-col gap-4 lg:gap-6 3xl:gap-8">
      <div className="flex flex-col gap-1">
        <h2>Jugá Cubito Run</h2>
        <p className="text-sm text-light-text">
          Esquivá obstáculos con Cubito y superá tu récord.
        </p>
      </div>

      <div className="w-full max-w-[760px] self-center [@media(pointer:coarse)]:hidden">
        <iframe
          src={CUBITO_RUN}
          title="Cubito Run, juego de Soonpublicité"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation"
          className="aspect-[4/3] w-full border-0 sm:aspect-[16/10]"
        />
      </div>

      <a
        href={CUBITO_RUN}
        className="hidden self-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 [@media(pointer:coarse)]:inline-block"
      >
        Jugar
      </a>
    </section>
  );
};

export default HomeCubitoRunSection;
