import logo from "@/assets/id-gestao-logo.png.asset.json";

type BrandMarkProps = {
  className?: string;
  /** Fundo escuro inverte o logo para manter contraste. */
  onDark?: boolean;
};

export function BrandMark({ className, onDark = false }: BrandMarkProps) {
  return (
    <img
      src={logo.url}
      alt="ID Gestão — Instituto Designio"
      className={className}
      style={onDark ? { filter: "brightness(0) invert(1)" } : undefined}
    />
  );
}