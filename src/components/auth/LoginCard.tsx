import { GoogleSignInButton } from "./GoogleSignInButton";
import { BrandMark } from "../branding/BrandMark";

type LoginCardProps = {
  onGoogleSignIn: () => void;
  loading?: boolean | undefined;
  disabled?: boolean | undefined;
  error?: string | null | undefined;
};

export function LoginCard({ onGoogleSignIn, loading, disabled, error }: LoginCardProps) {
  return (
    <div className="w-full max-w-md">
      <BrandMark className="mx-auto mb-8 h-28 w-auto lg:hidden" />

      <div className="surface-card rounded-2xl p-7 sm:p-9">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
          Bem-vindo ao ID Gestão
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Acesse o ambiente institucional com sua conta do Instituto Designio.
        </p>

        {error ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-7">
          <GoogleSignInButton onClick={onGoogleSignIn} loading={loading} disabled={disabled} />
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
          Acesso exclusivo para colaboradores autorizados do Instituto Designio.
          <br />
          Requer conta <span className="font-medium text-foreground">@institutodesignio.org</span>.
        </p>

        <div className="mt-7 flex items-center justify-center gap-2 border-t border-border pt-5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
          Ambiente seguro • Acesso institucional
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
        Instituto Designio • Plataforma de Gestão e Projetos
      </p>
    </div>
  );
}
