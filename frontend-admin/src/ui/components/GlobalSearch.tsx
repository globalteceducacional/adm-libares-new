import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, BookOpen, Users, Library } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type SearchResult = {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  href: string;
};

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setHighlighted(0);
    }
  }, [open]);

  if (!open) return null;

  // Search through cached query data
  const q = normalize(query.trim());
  const results: SearchResult[] = [];

  if (q.length >= 1) {
    // Search books from cache — look for any query key starting with "books"
    const allQueries = qc.getQueriesData<{ items?: unknown[]; [k: string]: unknown }>({ queryKey: [] });
    for (const [, data] of allQueries) {
      if (!data) continue;
      // books list
      const items = Array.isArray(data) ? data : (data as { items?: unknown[] }).items;
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        const book = item as { id?: number; title?: string; authorName?: string };
        if (book.title && normalize(book.title).includes(q)) {
          results.push({
            id: `book-${book.id}`,
            label: book.title,
            sublabel: book.authorName ?? undefined,
            icon: <BookOpen size={16} className="text-primary" />,
            href: `/livros`,
          });
        }
        const user = item as { id?: number; name?: string; email?: string };
        if (user.name && !(item as { title?: string }).title && normalize(user.name).includes(q)) {
          results.push({
            id: `user-${user.id}`,
            label: user.name,
            sublabel: user.email ?? undefined,
            icon: <Users size={16} className="text-accent" />,
            href: `/usuarios`,
          });
        }
        const acervo = item as { id?: number; nome?: string };
        if (acervo.nome && normalize(acervo.nome).includes(q)) {
          results.push({
            id: `acervo-${acervo.id}`,
            label: acervo.nome,
            icon: <Library size={16} className="text-warning-strong" />,
            href: `/acervos`,
          });
        }
      }
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  const deduped = results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  const limited = deduped.slice(0, 8);

  function handleSelect(result: SearchResult) {
    navigate(result.href);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, limited.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    if (e.key === "Enter" && limited[highlighted]) { handleSelect(limited[highlighted]); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Busca global">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface shadow-card mx-4 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setHighlighted(0); }}
            onKeyDown={onKeyDown}
            placeholder="Buscar livros, usuários, acervos..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
          />
          <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-surface-2">
            <X size={14} className="text-muted" />
          </button>
        </div>
        {query.trim().length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted">Digite para buscar em livros, usuários e acervos.</p>
        ) : limited.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted">Nenhum resultado para &ldquo;{query}&rdquo;.</p>
        ) : (
          <ul className="max-h-72 overflow-y-auto py-1">
            {limited.map((r, i) => (
              <li key={r.id}>
                <button
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${i === highlighted ? "bg-primary/[0.08] text-foreground" : "hover:bg-surface-2 text-foreground"}`}
                  onClick={() => handleSelect(r)}
                  onMouseEnter={() => setHighlighted(i)}
                >
                  <span className="shrink-0">{r.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{r.label}</span>
                    {r.sublabel ? <span className="block truncate text-xs text-muted">{r.sublabel}</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-border px-4 py-2 text-xs text-muted flex items-center gap-3">
          <span><kbd className="rounded border border-border px-1">↑↓</kbd> navegar</span>
          <span><kbd className="rounded border border-border px-1">Enter</kbd> selecionar</span>
          <span><kbd className="rounded border border-border px-1">Esc</kbd> fechar</span>
        </div>
      </div>
    </div>
  );
}
