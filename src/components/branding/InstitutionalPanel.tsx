import { BrandMark } from "./BrandMark";

/** Lado institucional do login: logo, hierarquia de marca e grafismo abstrato. */
export function InstitutionalPanel() {
  return (
    <section
      aria-label="Instituto Designio"
      className="bg-institutional relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14"
    >
      <AbstractCareGraphic />

      <div className="relative z-10 flex items-center gap-3">
        <BrandMark className="h-11 w-auto" onDark />
      </div>

      <div className="relative z-10 max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary-foreground/60">
          Instituto Designio
        </p>
        <h2 className="mt-4 text-4xl font-semibold leading-tight text-primary-foreground">
          ID Gestão
        </h2>
        <p className="mt-3 text-base text-primary-foreground/75">
          Plataforma de Gestão e Projetos
        </p>
        <div className="mt-8 h-px w-16 bg-primary-foreground/25" />
        <p className="mt-6 text-lg font-light italic leading-relaxed text-primary-foreground/85">
          “Cuidado, gestão e impacto em um só ambiente.”
        </p>
      </div>

      <p className="relative z-10 text-xs text-primary-foreground/45">
        Ambiente institucional • Instituto Designio
      </p>
    </section>
  );
}

/** Grafismo discreto: círculos concêntricos e laços — conexão e acolhimento. */
function AbstractCareGraphic() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.5]"
      viewBox="0 0 600 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="currentColor" className="text-accent/25">
        <circle cx="470" cy="250" r="120" strokeWidth="1" />
        <circle cx="470" cy="250" r="190" strokeWidth="1" opacity="0.6" />
        <circle cx="470" cy="250" r="265" strokeWidth="1" opacity="0.35" />
      </g>
      <path
        d="M-40 620 C 140 520, 220 700, 400 590 C 520 515, 560 600, 660 545"
        stroke="currentColor"
        className="text-accent/30"
        strokeWidth="1.5"
      />
      <path
        d="M-40 680 C 160 590, 240 760, 420 650 C 540 575, 580 660, 680 605"
        stroke="currentColor"
        className="text-accent/15"
        strokeWidth="1.5"
      />
      <g className="text-accent/40" fill="currentColor">
        <circle cx="400" cy="590" r="4" />
        <circle cx="470" cy="250" r="5" />
        <circle cx="140" cy="520" r="3" />
      </g>
    </svg>
  );
}