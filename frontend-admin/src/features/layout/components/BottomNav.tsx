import { NavLink } from "react-router-dom";
import { BookOpen, Users, LayoutDashboard, Library, MessageSquare } from "lucide-react";

const items = [
  { to: "/dashboard",    label: "Dashboard",    Icon: LayoutDashboard },
  { to: "/livros",       label: "Livros",        Icon: BookOpen },
  { to: "/usuarios",     label: "Usuários",      Icon: Users },
  { to: "/acervos",      label: "Acervos",       Icon: Library },
  { to: "/comentarios",  label: "Comentários",   Icon: MessageSquare },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/dashboard"}
          className={({ isActive }) =>
            `bottom-nav__item${isActive ? " bottom-nav__item--active" : ""}`
          }
        >
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
