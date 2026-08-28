import { useState } from "react";
import logoDark from "@/assets/id-gestao-logo-dark.png.asset.json";
import logoLight from "@/assets/id-gestao-logo-light.png.asset.json";

type BrandMarkProps = {
  className?: string;
  /** Fundo escuro inverte o logo para manter contraste. */
  onDark?: boolean;
};

export function BrandMark({ className, onDark = false }: BrandMarkProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={"inline-flex items-center gap-3 " + (className ?? "")}>
        <img src="/favicon.png" alt="" className="h-full w-auto object-contain" />
        <span
          className={
            "whitespace-nowrap text-sm font-semibold leading-tight " +
            (onDark ? "text-white" : "text-foreground")
          }
        >
          ID Gestão
        </span>
      </span>
    );
  }

  return (
    <img
      src={onDark ? logoLight.url : logoDark.url}
      alt="ID Gestão — Instituto Designio"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
