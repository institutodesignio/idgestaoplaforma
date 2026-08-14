import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { RequirePermission } from "@/components/shell/RequirePermission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/contexts/SessionContext";
import { PersonExportSection } from "@/features/privacy/components/PersonExportSection";
import { PrivacyRequestFormDialog } from "@/features/privacy/components/PrivacyRequestFormDialog";
import { PrivacyRequestUpdateDialog } from "@/features/privacy/components/PrivacyRequestUpdateDialog";
import { RetentionReviewsSection } from "@/features/privacy/components/RetentionReviewsSection";
import { usePrivacyRequests } from "@/features/privacy/queries";
import {
  PRIVACY_REQUEST_STATUS_LABEL,
  PRIVACY_REQUEST_STATUS_OPTIONS,
  PRIVACY_REQUEST_TYPE_LABEL,
  daysUntil,
  type PrivacyRequest,
} from "@/features/privacy/types";
import { PersonName } from "@/features/persons/components/PersonName";
import { formatDate } from "@/lib/format";

type PrivacySearch = { page: number; status: string };

export const Route = createFileRoute("/app/privacidade")({
  validateSearch: (search: Record<string, unknown>): PrivacySearch => ({
    page: Number(search["page"]) > 0 ? Number(search["page"]) : 1,
    status: typeof search["status"] === "string" ? search["status"] : "",
  }),
  component: () => (
    <RequirePermission anyPermission={["privacy.read", "privacy.manage"]}>
      <PrivacyPage />
    </RequirePermission>
  ),
});

const LIMIT = 20;

function PrivacyPage() {
  const { page, status } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { can } = useSession();
  const canManage = can("privacy.manage");

  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<PrivacyRequest | null>(null);

  const query = usePrivacyRequests({ page, limit: LIMIT, status });
  const requests = query.data?.data ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Módulo
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Privacidade e retenção
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Solicitações de titulares, prazos legais, revisões de retenção e exportação de dados.
          </p>
        </div>
        {canManage ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            Nova solicitação
          </Button>
        ) : null}
      </header>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="retention">Retenção</TabsTrigger>
          <TabsTrigger value="export">Exportação</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4 pt-6">
          <Select
            value={status || "ALL"}
            onValueChange={(value) =>
              void navigate({
                search: (prev: PrivacySearch) => ({
                  ...prev,
                  status: value === "ALL" ? "" : value,
                  page: 1,
                }),
              })
            }
          >
            <SelectTrigger aria-label="Filtrar por situação" className="sm:max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as situações</SelectItem>
              {PRIVACY_REQUEST_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {query.isLoading ? (
            <ListSkeleton />
          ) : query.isError ? (
            <ErrorState
              title="Não foi possível carregar as solicitações"
              error={query.error}
              onRetry={() => void query.refetch()}
            />
          ) : requests.length === 0 ? (
            <EmptyState
              title="Nenhuma solicitação registrada"
              description="Pedidos de acesso, correção e eliminação aparecerão aqui."
            />
          ) : (
            <ul className="space-y-3">
              {requests.map((request) => {
                const remaining = daysUntil(request.due_at);
                return (
                  <li
                    key={request.id}
                    className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                      <ShieldCheck aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-48 flex-1">
                      <p className="font-medium text-foreground">
                        {PRIVACY_REQUEST_TYPE_LABEL[String(request.request_type)] ??
                          request.request_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <PersonName personId={request.person_id} fallback="Titular" /> • recebida em{" "}
                        {formatDate(request.received_at ?? request.created_at)}
                        {remaining !== null
                          ? remaining < 0
                            ? ` • prazo vencido há ${Math.abs(remaining)} dia(s)`
                            : ` • ${remaining} dia(s) para responder`
                          : ""}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {PRIVACY_REQUEST_STATUS_LABEL[String(request.status)] ?? request.status}
                    </Badge>
                    {canManage ? (
                      <Button variant="outline" size="sm" onClick={() => setSelected(request)}>
                        Atualizar
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}

          {requests.length > 0 ? (
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Página {page} • {requests.length} solicitação(ões) nesta página
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() =>
                    void navigate({
                      search: (prev: PrivacySearch) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }),
                    })
                  }
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={requests.length < LIMIT}
                  onClick={() =>
                    void navigate({
                      search: (prev: PrivacySearch) => ({ ...prev, page: prev.page + 1 }),
                    })
                  }
                >
                  Próxima
                </Button>
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="retention" className="pt-6">
          <RetentionReviewsSection canManage={canManage} />
        </TabsContent>

        <TabsContent value="export" className="pt-6">
          <PersonExportSection />
        </TabsContent>
      </Tabs>

      <PrivacyRequestFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <PrivacyRequestUpdateDialog
        request={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
