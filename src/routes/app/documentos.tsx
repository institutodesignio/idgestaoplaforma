import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, FileText, Plus, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/data/QueryStates";
import { RequirePermission } from "@/components/shell/RequirePermission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/SessionContext";
import {
  useCreateDocument,
  useDocuments,
  useDocumentTemplates,
  useDocumentDownload,
  useUploadDocumentVersion,
  useUpdateDocument,
} from "@/features/documents/queries";
import {
  DOCUMENT_CLASSIFICATION_LABEL,
  DOCUMENT_MIME_TYPES,
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_STATUS_OPTIONS,
  type DocumentClassification,
  type DocumentStatus,
  type InstitutionalDocument,
} from "@/features/documents/types";
import { PersonName } from "@/features/persons/components/PersonName";
import { PersonPicker } from "@/features/persons/components/PersonPicker";
import { apiErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

type DocumentSearch = { status: string; classification: string };

export const Route = createFileRoute("/app/documentos")({
  validateSearch: (search: Record<string, unknown>): DocumentSearch => ({
    status: typeof search["status"] === "string" ? search["status"] : "",
    classification: typeof search["classification"] === "string" ? search["classification"] : "",
  }),
  component: () => (
    <RequirePermission permission="document.read">
      <DocumentsPage />
    </RequirePermission>
  ),
});

function DocumentsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { can } = useSession();
  const query = useDocuments(search);
  const templates = useDocumentTemplates();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<InstitutionalDocument | null>(null);
  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Módulo
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Documentos</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Registro institucional com classificação, versionamento e fluxo de aprovação.
          </p>
        </div>
        {can("document.create") ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Novo documento
          </Button>
        ) : null}
      </header>

      <section aria-label="Resumo de documentos" className="grid gap-3 sm:grid-cols-3">
        <Metric label="Documentos encontrados" value={rows.length} />
        <Metric label="Modelos disponíveis" value={templates.data?.data.length ?? 0} />
        <Metric
          label="Aguardando aprovação"
          value={rows.filter((row) => row.status === "READY_FOR_APPROVAL").length}
        />
      </section>

      <section
        aria-label="Filtros de documentos"
        className="surface-card grid gap-3 rounded-2xl p-4 sm:grid-cols-2"
      >
        <Select
          value={search.status || "ALL"}
          onValueChange={(value) =>
            void navigate({
              search: (prev: DocumentSearch) => ({ ...prev, status: value === "ALL" ? "" : value }),
            })
          }
        >
          <SelectTrigger aria-label="Filtrar por situação">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as situações</SelectItem>
            {DOCUMENT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={search.classification || "ALL"}
          onValueChange={(value) =>
            void navigate({
              search: (prev: DocumentSearch) => ({
                ...prev,
                classification: value === "ALL" ? "" : value,
              }),
            })
          }
        >
          <SelectTrigger aria-label="Filtrar por classificação">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as classificações</SelectItem>
            {Object.entries(DOCUMENT_CLASSIFICATION_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section aria-label="Documentos institucionais">
        {query.isLoading ? (
          <ListSkeleton />
        ) : query.isError ? (
          <ErrorState
            title="Não foi possível carregar os documentos"
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Nenhum documento encontrado"
            description="Ajuste os filtros ou registre um novo documento."
          />
        ) : (
          <ul className="space-y-3">
            {rows.map((document) => (
              <li
                key={document.id}
                className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-52 flex-1">
                  <p className="font-medium">{document.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {document.category} • versão {document.current_version} • atualizado{" "}
                    {formatDateTime(document.updated_at)}
                  </p>
                  {document.person_id ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pessoa vinculada: <PersonName personId={document.person_id} />
                    </p>
                  ) : null}
                </div>
                <Badge variant="secondary">
                  {DOCUMENT_CLASSIFICATION_LABEL[document.classification] ??
                    document.classification}
                </Badge>
                <Badge variant="outline">
                  {DOCUMENT_STATUS_LABEL[document.status] ?? document.status}
                </Badge>
                {can("document.update") || can("document.approve") || can("document.sign") ? (
                  <Button size="sm" variant="outline" onClick={() => setSelected(document)}>
                    Atualizar
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <DocumentCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <DocumentStatusDialog
        document={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-card rounded-2xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function DocumentCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const save = useCreateDocument();
  const templates = useDocumentTemplates();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [classification, setClassification] = useState<DocumentClassification>("INTERNAL");
  const [templateId, setTemplateId] = useState("");
  const [personId, setPersonId] = useState("");
  const [personLabel, setPersonLabel] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setTitle("");
      setCategory("");
      setDescription("");
      setClassification("INTERNAL");
      setTemplateId("");
      setPersonId("");
      setPersonLabel("");
      setError("");
    }
  }, [open]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !category.trim()) {
      setError("Informe título e categoria.");
      return;
    }
    try {
      await save.mutateAsync({
        title: title.trim(),
        category: category.trim(),
        description: description.trim() || null,
        classification,
        template_id: templateId || null,
        person_id: personId || null,
      });
      toast.success("Documento criado.");
      onOpenChange(false);
    } catch (reason) {
      setError(apiErrorMessage(reason));
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo documento</DialogTitle>
          <DialogDescription>
            Crie o registro e vincule-o apenas quando necessário.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Título
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={250}
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Categoria
              <Input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                maxLength={80}
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Classificação
              <Select
                value={classification}
                onValueChange={(value) => setClassification(value as DocumentClassification)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_CLASSIFICATION_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Modelo opcional
              <Select
                value={templateId || "NONE"}
                onValueChange={(value) => {
                  const id = value === "NONE" ? "" : value;
                  setTemplateId(id);
                  const template = templates.data?.data.find((item) => item.id === id);
                  if (template) {
                    setCategory(template.category);
                    if (!title) setTitle(template.title);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sem modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Sem modelo</SelectItem>
                  {templates.data?.data.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.code} — {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium">
            Descrição
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
            />
          </label>
          <div className="space-y-2">
            <Label>Pessoa vinculada (opcional)</Label>
            <PersonPicker
              value={personId}
              selectedLabel={personLabel}
              onChange={(id, person) => {
                setPersonId(id);
                setPersonLabel(person.full_name);
              }}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DocumentStatusDialog({
  document,
  open,
  onOpenChange,
}: {
  document: InstitutionalDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { can } = useSession();
  const save = useUpdateDocument();
  const upload = useUploadDocumentVersion();
  const download = useDocumentDownload();
  const [status, setStatus] = useState<DocumentStatus>("DRAFT");
  const [voidReason, setVoidReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    if (document) {
      setStatus(document.status as DocumentStatus);
      setVoidReason(document.void_reason ?? "");
      setFile(null);
    }
  }, [document]);
  const allowed = DOCUMENT_STATUS_OPTIONS.filter((option) => {
    if (option.value === "APPROVED") return can("document.approve");
    if (option.value === "SIGNED") return can("document.sign");
    return can("document.update");
  });
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!document) return;
    if (status === "VOID" && !voidReason.trim()) {
      toast.error("Informe o motivo da anulação.");
      return;
    }
    try {
      await save.mutateAsync({
        id: document.id,
        input: { status, ...(status === "VOID" ? { void_reason: voidReason.trim() } : {}) },
      });
      toast.success("Documento atualizado.");
      onOpenChange(false);
    } catch (reason) {
      toast.error(apiErrorMessage(reason));
    }
  }
  async function handleUpload() {
    if (!document || !file) return;
    if (!(DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
      toast.error("Use PDF, JPG, PNG ou DOCX.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 25 MB.");
      return;
    }
    try {
      await upload.mutateAsync({ document, file });
      toast.success("Nova versão enviada com segurança.");
      setFile(null);
      onOpenChange(false);
    } catch (reason) {
      toast.error(apiErrorMessage(reason));
    }
  }
  async function handleDownload() {
    if (!document) return;
    try {
      const response = await download.mutateAsync(document.id);
      const url = response.data.signedUrl ?? response.data.signed_url;
      if (!url) throw new Error("URL ausente");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (reason) {
      toast.error(apiErrorMessage(reason));
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar documento</DialogTitle>
          <DialogDescription>{document?.title}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="document-status">Situação</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as DocumentStatus)}>
              <SelectTrigger id="document-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowed.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {status === "VOID" ? (
            <label className="space-y-2 text-sm font-medium">
              Motivo da anulação
              <Textarea
                value={voidReason}
                onChange={(event) => setVoidReason(event.target.value)}
                maxLength={2000}
              />
            </label>
          ) : null}
          {can("document.update") ? (
            <div className="space-y-2 rounded-xl border border-border p-3">
              <Label htmlFor="document-file">Nova versão do arquivo</Label>
              <Input
                id="document-file"
                type="file"
                accept={DOCUMENT_MIME_TYPES.join(",")}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                PDF, JPG, PNG ou DOCX, até 25 MB. O link de envio expira automaticamente.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!file || upload.isPending}
                onClick={() => void handleUpload()}
              >
                <Upload className="size-4" aria-hidden="true" />
                {upload.isPending ? "Enviando…" : "Enviar nova versão"}
              </Button>
            </div>
          ) : null}
          {can("document.export") && document && document.current_version > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={download.isPending}
              onClick={() => void handleDownload()}
            >
              <Download className="size-4" aria-hidden="true" />
              Baixar versão atual
            </Button>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
