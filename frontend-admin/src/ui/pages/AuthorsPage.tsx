import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  getQueryErrorMessage,
  useAuthorOptionsQuery
} from "../../features/shared/api/queries";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { LegacyImage } from "../components/LegacyImage";
import type { AuthorOptionResponse } from "../../types/authors";
import { type DataTableColumn } from "../components/table/DataTable";

export function AuthorsPage() {
  const { search, setSearch } = useAdminListFilters({ syncStatus: false });
  const { data: authors = [], isLoading, error } = useAuthorOptionsQuery();
  const errorMessage = error
    ? getQueryErrorMessage(error, "Falha ao carregar autores")
    : undefined;

  const columns = useMemo<DataTableColumn<AuthorOptionResponse>[]>(
    () => [
      { key: "id", label: "ID", render: (author) => author.id },
      {
        key: "photo",
        label: "Foto",
        render: (author) => (
          <LegacyImage
            legacyPath={author.image}
            folder="images"
            alt={`Foto de ${author.name}`}
            className="table-avatar"
            fallbackClassName="table-avatar-placeholder"
            fallbackText={author.name.charAt(0).toUpperCase()}
          />
        )
      },
      { key: "name", label: "Nome", render: (author) => author.name }
    ],
    []
  );

  const filteredAuthors = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (normalized.length === 0) {
      return authors;
    }
    return authors.filter(
      (author) =>
        author.name.toLowerCase().includes(normalized) || String(author.id).includes(normalized)
    );
  }, [authors, search]);

  const emptyMessage = useMemo(
    () =>
      authors.length === 0 ? "Nenhum autor encontrado." : "Nenhum autor corresponde ao filtro.",
    [authors.length]
  );

  return (
    <motion.section
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <AdminListingSection<AuthorOptionResponse>
        title="Gestao de Autores"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome ou ID"
        searchAriaLabel="Filtrar autores"
        columns={columns}
        data={filteredAuthors}
        loading={isLoading}
        keyExtractor={(author) => author.id}
        emptyMessage={emptyMessage}
        countLabel={`${filteredAuthors.length} autor(es) com o filtro atual`}
        error={errorMessage}
        renderMobileCard={(author) => (
          <article className="book-card">
            <div className="book-card-media">
              <LegacyImage
                legacyPath={author.image}
                folder="images"
                alt={`Foto de ${author.name}`}
                className="table-avatar"
                fallbackClassName="table-avatar-placeholder"
                fallbackText={author.name.charAt(0).toUpperCase()}
              />
            </div>
            <div className="book-card-body">
              <p className="book-card-id">#{author.id}</p>
              <h3>{author.name}</h3>
            </div>
          </article>
        )}
      />
    </motion.section>
  );
}
