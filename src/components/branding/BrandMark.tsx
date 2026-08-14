import logoDark from "@/assets/id-gestao-logo-dark.png.asset.json";
import logoLight from "@/assets/id-gestao-logo-light.png.asset.json";

type BrandMarkProps = {
  className?: string;
  /** Fundo escuro inverte o logo para manter contraste. */
  onDark?: boolean;
};

export function BrandMark({ className, onDark = false }: BrandMarkProps) {
  return (
    <img
      src={onDark ? logoLight.url : logoDark.url}
      alt="ID Gestão — Instituto Designio"
      className={className}
    />
  );
}
