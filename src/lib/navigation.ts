import {
  CalendarDays,
  Building2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ShieldCheck,
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
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Visão Geral", to: "/app", icon: LayoutDashboard },
  { label: "Pessoas", to: "/app/pessoas", icon: Users, permission: "person.read" },
  { label: "Projetos", to: "/app/projetos", icon: FolderKanban, permission: "project.read" },
  { label: "Unidades", to: "/app/unidades", icon: Building2, permission: "unit.read" },
  { label: "Agenda", to: "/app/agenda", icon: CalendarDays, permission: "appointment.read" },
  { label: "Documentos", to: "/app/documentos", icon: FileText, permission: "document.read" },
  { label: "Financeiro", to: "/app/financeiro", icon: Wallet, permission: "finance.read" },
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
      "membership.manage",
    ],
  },
];
