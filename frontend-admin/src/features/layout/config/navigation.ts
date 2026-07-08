import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  MessageSquareText,
  Pencil,
  Tags,
  Users
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Visao geral e metricas" },
  { to: "/livros", label: "Livros", icon: BookOpen, description: "Catalogo e cadastro" },
  { to: "/autores", label: "Autores", icon: Pencil, description: "Autores do catalogo" },
  { to: "/categorias", label: "Categorias", icon: Tags, description: "Categorias do catalogo" },
  { to: "/usuarios", label: "Usuarios", icon: Users, description: "Gestao de usuarios" },
  { to: "/comentarios", label: "Comentarios", icon: MessageSquareText, description: "Moderacao" },
  { to: "/auditoria", label: "Auditoria", icon: ClipboardList, description: "Logs e consistencia" }
];

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => item.to === pathname);
}

export function buildBreadcrumbs(pathname: string) {
  const current = findNavItem(pathname);
  return [
    { label: "Painel", to: "/dashboard" },
    ...(current && current.to !== "/dashboard" ? [{ label: current.label }] : [{ label: "Dashboard" }])
  ];
}
