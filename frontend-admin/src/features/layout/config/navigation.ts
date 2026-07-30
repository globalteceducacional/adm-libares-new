import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  ClipboardList,
  Globe,
  LayoutDashboard,
  LayoutList,
  Library,
  MessageSquareText,
  Pencil,
  Shield,
  Tags,
  Users
} from "lucide-react";

export type NavBadgeKey =
  | "books"
  | "authors"
  | "categories"
  | "homeSections"
  | "acervos"
  | "users"
  | "comments";

export type NavItemConfig = {
  id: string;
  to: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  badgeKey?: NavBadgeKey;
  /** Se omitido, visivel para qualquer usuario autenticado. */
  permission?: string;
  keywords?: string[];
};

export type NavGroupConfig = {
  id: string;
  label: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  permission?: string;
  items: NavItemConfig[];
};

export const NAV_GROUPS: NavGroupConfig[] = [
  {
    id: "overview",
    label: "Visao Geral",
    items: [
      {
        id: "dashboard",
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Metricas e indicadores",
        permission: "reports.view",
        keywords: ["inicio", "home", "painel"]
      }
    ]
  },
  {
    id: "catalog",
    label: "Catalogo",
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: "books",
        to: "/livros",
        label: "Livros",
        icon: BookOpen,
        description: "Cadastro e gestao de livros",
        badgeKey: "books",
        permission: "books.view",
        keywords: ["catalogo", "obras", "titulos"]
      },
      {
        id: "authors",
        to: "/autores",
        label: "Autores",
        icon: Pencil,
        description: "Autores do catalogo",
        badgeKey: "authors",
        permission: "books.update",
        keywords: ["escritores", "catalogo"]
      },
      {
        id: "categories",
        to: "/categorias",
        label: "Categorias",
        icon: Tags,
        description: "Categorias globais do catalogo",
        badgeKey: "categories",
        permission: "books.update",
        keywords: ["categoria", "catalogo"]
      },
      {
        id: "home-sections",
        to: "/secoes",
        label: "Seções",
        icon: LayoutList,
        description: "Seções da home e livros vinculados",
        badgeKey: "homeSections",
        permission: "books.update",
        keywords: ["home", "destaque", "vitrine", "secoes", "seções"]
      },
      {
        id: "acervos",
        to: "/acervos",
        label: "Acervos",
        icon: Library,
        description: "Bibliotecas digitais por escola",
        badgeKey: "acervos",
        permission: "acervos.view",
        keywords: ["escola", "biblioteca", "colecao"]
      }
    ]
  },
  {
    id: "site",
    label: "Site",
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: "sites",
        to: "/sites",
        label: "Sites",
        icon: Globe,
        description: "Conteudos do catalogo Site",
        permission: "sites.view",
        keywords: ["site", "web", "conteudo"]
      },
      {
        id: "site-authors",
        to: "/sites/autores",
        label: "Autores",
        icon: Pencil,
        description: "Autores do catalogo Site",
        permission: "sites.view",
        keywords: ["site", "autores"]
      },
      {
        id: "site-categories",
        to: "/sites/categorias",
        label: "Categorias",
        icon: Tags,
        description: "Categorias do catalogo Site",
        permission: "sites.view",
        keywords: ["site", "categorias"]
      },
      {
        id: "site-sections",
        to: "/sites/secoes",
        label: "Seções",
        icon: LayoutList,
        description: "Seções da home do Site",
        permission: "sites.view",
        keywords: ["site", "secoes", "seções", "home"]
      },
      {
        id: "site-comments",
        to: "/sites/comentarios",
        label: "Comentários",
        icon: MessageSquareText,
        description: "Moderacao de comentarios do Site",
        permission: "sites.comments.view",
        keywords: ["site", "comentarios", "moderacao"]
      }
    ]
  },
  {
    id: "community",
    label: "Comunidade",
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: "users",
        to: "/usuarios",
        label: "Usuarios",
        icon: Users,
        description: "Contas e perfis",
        badgeKey: "users",
        permission: "users.view",
        keywords: ["contas", "membros"]
      },
      {
        id: "comments",
        to: "/comentarios",
        label: "Comentarios",
        icon: MessageSquareText,
        description: "Moderacao de comentarios",
        badgeKey: "comments",
        permission: "users.view",
        keywords: ["moderacao", "reviews"]
      }
    ]
  },
  {
    id: "system",
    label: "Sistema",
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: "schools",
        to: "/escolas",
        label: "Escolas",
        icon: Building2,
        description: "Tenants e escolas da plataforma",
        permission: "schools.view",
        keywords: ["tenant", "instituicao"]
      },
      {
        id: "roles",
        to: "/perfis",
        label: "Perfis",
        icon: Shield,
        description: "Perfis e permissoes da escola",
        permission: "roles.view",
        keywords: ["rbac", "permissoes", "acesso"]
      },
      {
        id: "audit",
        to: "/auditoria",
        label: "Auditoria",
        icon: ClipboardList,
        description: "Logs e consistencia de dados",
        permission: "reports.view",
        keywords: ["logs", "historico", "rastreio"]
      }
    ]
  }
];

/** Lista plana (compatibilidade com breadcrumbs/topbar). */
export const NAV_ITEMS: NavItemConfig[] = NAV_GROUPS.flatMap((g) => g.items);

export function hasNavPermission(
  permission: string | undefined,
  permissions: Set<string>,
  isSuperAdmin: boolean
): boolean {
  if (!permission) {
    return true;
  }
  return isSuperAdmin || permissions.has(permission);
}

export function isNavItemVisible(
  item: NavItemConfig,
  permissions: Set<string>,
  isSuperAdmin: boolean
): boolean {
  return hasNavPermission(item.permission, permissions, isSuperAdmin);
}

export function isNavGroupVisible(
  group: NavGroupConfig,
  permissions: Set<string>,
  isSuperAdmin: boolean
): boolean {
  if (group.permission && !hasNavPermission(group.permission, permissions, isSuperAdmin)) {
    return false;
  }
  return group.items.some((item) => isNavItemVisible(item, permissions, isSuperAdmin));
}

export function filterNavigation(permissions: Set<string>, isSuperAdmin: boolean): NavGroupConfig[] {
  return NAV_GROUPS.filter((group) => isNavGroupVisible(group, permissions, isSuperAdmin))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isNavItemVisible(item, permissions, isSuperAdmin))
    }))
    .filter((group) => group.items.length > 0);
}

export function findNavItem(pathname: string): NavItemConfig | undefined {
  return NAV_ITEMS.find((item) => item.to === pathname);
}

export function buildBreadcrumbs(pathname: string) {
  const current = findNavItem(pathname);
  const group = NAV_GROUPS.find((g) => g.items.some((i) => i.to === pathname));
  return [
    { label: "Painel", to: "/dashboard" },
    ...(group && group.id !== "overview" ? [{ label: group.label }] : []),
    ...(current && current.to !== "/dashboard" ? [{ label: current.label }] : [{ label: "Dashboard" }])
  ];
}

export function filterNavBySearch(groups: NavGroupConfig[], query: string): NavGroupConfig[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return groups;
  }
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.keywords?.some((k) => k.includes(q))
      )
    }))
    .filter((group) => group.items.length > 0);
}

export function findNavPermissionForPath(pathname: string): string | undefined {
  return findNavItem(pathname)?.permission;
}
