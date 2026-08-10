import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Pencil, Plus, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/contexts/SessionContext";
import { AddressFormDialog } from "@/features/persons/components/AddressFormDialog";
import { PersonFormDialog } from "@/features/persons/components/PersonFormDialog";
import { RelationshipFormDialog } from "@/features/persons/components/RelationshipFormDialog";
import { StatusBadge } from "@/features/persons/components/StatusBadge";
import { usePerson } from "@/features/persons/queries";
import {
  ADDRESS_TYPE_OPTIONS,
  PERSON_TYPE_LABEL,
  RELATIONSHIP_TYPE_OPTIONS,
  type PersonAddress,
  type PersonRelationship,
  type PersonType,
} from "@/features/persons/types";
import { apiErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/app/pessoas/$personId")({
  component: PersonDetailPage,
});

function label(options: { value: string; label: string }[], value: string | null) {
  if (!value) return "—";
  return options.find((option) => option.value === value)?.label ?? value;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function Field({ label: fieldLabel, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {fieldLabel}
      </p>
      <p className="mt-1 text-sm text-foreground">{value && value !== "" ? value : "—"}</p>
    </div>
  );
}

function PersonDetailPage() {
  const { personId } = Route.useParams();
  const { hasPermission } = useSession();
  const canUpdate = hasPermission("person.update");

  const query = usePerson(personId);
  const [editPersonOpen, setEditPersonOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [address, setAddress] = useState<PersonAddress | null>(null);
  const [relationshipOpen, setRelationshipOpen] = useState(false);
  const [relationship, setRelationship] = useState<PersonRelationship | null>(null);

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="surface-card mx-auto max-w-lg rounded-2xl p-8 text-center">
        <p className="text-sm font-medium text-foreground">Não foi possível abrir a ficha</p>
        <p className="mt-2 text-sm text-muted-foreground">{apiErrorMessage(query.error)}</p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="outline" onClick={() => void query.refetch()}>
            Tentar novamente
          </Button>
          <Button asChild variant="ghost">
            <Link to="/app/pessoas" search={{ page: 1, search: "", status: "", type: "" }}>
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { person, addresses, relationships } = query.data;
  const isIndividual = person.person_type === "INDIVIDUAL";

  return (
    <div className="space-y-8">
      <Link
        to="/app/pessoas"
        search={{ page: 1, search: "", status: "", type: "" }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar para Pessoas
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {PERSON_TYPE_LABEL[person.person_type as PersonType] ?? "Pessoa"}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {person.full_name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={person.status} />
            {person.preferred_name ? (
              <Badge variant="outline">Prefere: {person.preferred_name}</Badge>
            ) : null}
          </div>
        </div>
        {canUpdate ? (
          <Button variant="outline" onClick={() => setEditPersonOpen(true)}>
            <Pencil aria-hidden="true" className="size-4" />
            Editar pessoa
          </Button>
        ) : null}
      </header>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Dados gerais</TabsTrigger>
          <TabsTrigger value="addresses">Endereços</TabsTrigger>
          <TabsTrigger value="relationships">Vínculos e responsáveis</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="surface-card grid gap-6 rounded-2xl p-6 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nome completo" value={person.full_name} />
            <Field label="Nome preferido" value={person.preferred_name} />
            {isIndividual ? (
              <Field label="CPF" value={person.cpf} />
            ) : (
              <Field label="CNPJ" value={person.cnpj} />
            )}
            <Field label="E-mail principal" value={person.primary_email} />
            <Field label="Telefone principal" value={person.primary_phone} />
            {isIndividual ? (
              <>
                <Field label="Data de nascimento" value={formatDate(person.birth_date)} />
                <Field label="Gênero" value={person.gender} />
                <Field label="Estado civil" value={person.marital_status} />
                <Field label="Nacionalidade" value={person.nationality} />
                <Field label="RG" value={person.rg} />
                <Field label="Órgão emissor" value={person.rg_issuer} />
                <Field label="NIS" value={person.nis} />
              </>
            ) : null}
            <Field label="Ocupação" value={person.occupation} />
          </div>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6 space-y-4">
          {canUpdate ? (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setAddress(null);
                  setAddressOpen(true);
                }}
              >
                <Plus aria-hidden="true" className="size-4" />
                Adicionar endereço
              </Button>
            </div>
          ) : null}

          {addresses.length === 0 ? (
            <div className="surface-card rounded-2xl p-10 text-center">
              <MapPin aria-hidden="true" className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum endereço cadastrado para esta pessoa.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {addresses.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.is_primary
                      ? "surface-card rounded-2xl border-primary/40 p-5 ring-1 ring-primary/30"
                      : "surface-card rounded-2xl p-5"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label(ADDRESS_TYPE_OPTIONS, item.address_type)}
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {[item.street, item.street_number].filter(Boolean).join(", ") || "—"}
                        {item.address_complement ? ` — ${item.address_complement}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {[item.neighborhood, item.city, item.state_code]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        CEP {item.postal_code ?? "—"} • {item.country_code ?? "—"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {item.is_primary ? <Badge>Principal</Badge> : null}
                      {canUpdate ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAddress(item);
                            setAddressOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="relationships" className="mt-6 space-y-4">
          {canUpdate ? (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setRelationship(null);
                  setRelationshipOpen(true);
                }}
              >
                <Plus aria-hidden="true" className="size-4" />
                Adicionar vínculo
              </Button>
            </div>
          ) : null}

          {relationships.length === 0 ? (
            <div className="surface-card rounded-2xl p-10 text-center">
              <Users aria-hidden="true" className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum vínculo registrado para esta pessoa.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {relationships.map((item) => (
                <li key={item.id} className="surface-card rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {label(RELATIONSHIP_TYPE_OPTIONS, item.relationship_type)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.related_person?.full_name ??
                          (item.related_person_id
                            ? `Pessoa vinculada ${item.related_person_id.slice(0, 8)}…`
                            : "—")}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Início {formatDate(item.starts_at)} • Término {formatDate(item.ends_at)}
                      </p>
                      {item.notes ? (
                        <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.is_legal_guardian ? (
                          <Badge variant="secondary">Responsável legal</Badge>
                        ) : null}
                        {item.is_financial_responsible ? (
                          <Badge variant="secondary">Responsável financeiro</Badge>
                        ) : null}
                      </div>
                    </div>
                    {canUpdate ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRelationship(item);
                          setRelationshipOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <PersonFormDialog open={editPersonOpen} onOpenChange={setEditPersonOpen} person={person} />
      <AddressFormDialog
        open={addressOpen}
        onOpenChange={setAddressOpen}
        personId={personId}
        address={address}
      />
      <RelationshipFormDialog
        open={relationshipOpen}
        onOpenChange={setRelationshipOpen}
        personId={personId}
        relationship={relationship}
      />
    </div>
  );
}
