import {
  CalendarDays,
  Building2,
  BarChart3,
  FileText,
  FolderKanban,
  HeartHandshake,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Permissão exigida pelo backend; undefined = sempre visível para autenticados. */
  permission?: string;
  /** Alternativas administrativas: qualquer uma libera o item. */
  anyPermission?: string[];
  /** Módulo sem endpoint oficial: exibido como em planejamento. */
  planned?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Visão Geral", to: "/app", icon: LayoutDashboard },
  { label: "Pessoas", to: "/app/pessoas", icon: Users, permission: "person.read" },
  { label: "Projetos", to: "/app/projetos", icon: FolderKanban, permission: "project.read" },
  { label: "Unidades", to: "/app/unidades", icon: Building2, permission: "unit.read" },
  {
    label: "Equipe",
    to: "/app/equipe",
    icon: Users,
    anyPermission: ["user.read", "role.read"],
  },
  {
    label: "Supervisão Clínica",
    to: "/app/supervisao",
    icon: Stethoscope,
    anyPermission: ["clinical_supervision.read", "clinical_supervision.manage"],
  },
  {
    label: "Cadastro Neurodivergente",
    to: "/app/cadastro-neurodivergente",
    icon: Sparkles,
    anyPermission: ["neurodivergent_profile.read", "neurodivergent_profile.manage"],
  },
  {
    label: "Demandas",
    to: "/app/demandas",
    icon: HeartHandshake,
    anyPermission: ["care_request.read", "care_request.manage"],
  },
  {
    label: "Indicadores",
    to: "/app/indicadores",
    icon: BarChart3,
    permission: "indicator.read",
  },
  {
    label: "Privacidade",
    to: "/app/privacidade",
    icon: ShieldCheck,
    anyPermission: ["privacy.read", "privacy.manage"],
  },
  { label: "Auditoria", to: "/app/auditoria", icon: ScrollText, permission: "audit.read" },
  {
    label: "Agenda",
    to: "/app/agenda",
    icon: CalendarDays,
    permission: "appointment.read",
  },
  {
    label: "Documentos",
    to: "/app/documentos",
    icon: FileText,
    permission: "document.read",
  },
  {
    label: "Financeiro",
    to: "/app/financeiro",
    icon: Wallet,
    permission: "finance.read",
  },
  {
    label: "Administração",
    to: "/app/administracao",
    icon: ShieldCheck,
    anyPermission: [
      "admin.read",
      "organization.manage",
      "role.read",
      "role.manage",
      "permission.read",
      "user.manage",
      "user.invite",
      "audit.read",
      "membership.manage",
    ],
  },
];
