import { FormEvent, useMemo, useState } from "react";
import { Gamepad2, Pencil, Plus, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { createGame, deleteGame, updateGame, uploadGameCover } from "../../services/gamesService";
import {
  getQueryErrorMessage,
  useGamesQuery,
  useInvalidateAdminQueries
} from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import { PermissionGate } from "../../features/auth/PermissionGate";
import { usePermission } from "../../features/auth/usePermission";
import { AdminListingSection } from "../components/layout/AdminListingSection";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { LegacyImage } from "../components/LegacyImage";
import { EMPTY_GAME_FORM, type GameResponse, type UpsertGameRequest } from "../../types/games";
import { useAdminListFilters } from "../../hooks/useAdminListFilters";
import { useAdminMutation } from "../../hooks/useAdminMutation";
import { Alert, Button, ConfirmDialog, Field, Input, Modal, StatusBadge } from "../../shared/ui";
import { decodeHtmlEntities } from "../../shared/lib/decodeHtmlEntities";
import { stripHtml } from "../../shared/lib/stripHtml";
import { type DataTableColumn } from "../components/table/DataTable";
import { TableRowActions } from "../components/table/TableRowActions";

export function GamesPage() {
  const location = useLocation();
  const { search, setSearch, statusFilter, setStatusFilter } = useAdminListFilters();
  const gamesQuery = useGamesQuery();
  const invalidate = useInvalidateAdminQueries();
  const games = gamesQuery.data ?? [];
  const loading = gamesQuery.isLoading;
  const listingError = gamesQuery.error
    ? getQueryErrorMessage(gamesQuery.error, "Falha ao carregar jogos")
    : undefined;

  const canCreate = usePermission("games.create");
  const canUpdate = usePermission("games.update");
  const canDelete = usePermission("games.delete");

  const [form, setForm] = useState<UpsertGameRequest>(EMPTY_GAME_FORM);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return games.filter((game) => {
      const statusOk =
        statusFilter === "all" ||
        (statusFilter === "1" && game.status === 1) ||
        (statusFilter === "0" && game.status === 0);
      if (!statusOk) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        decodeHtmlEntities(game.title).toLowerCase().includes(q) ||
        stripHtml(game.description).toLowerCase().includes(q)
      );
    });
  }, [games, search, statusFilter]);

  const saveMutation = useAdminMutation<GameResponse, { id: number | null; payload: UpsertGameRequest }>({
    mutationFn: ({ id, payload }) => (id ? updateGame(id, payload) : createGame(payload)),
    successMessage: (_data, { id }) => (id ? "Jogo atualizado com sucesso." : "Jogo criado com sucesso."),
    errorFallback: "Falha ao salvar jogo",
    invalidate: () => invalidate.games(),
    onSuccess: () => {
      setFormModalOpen(false);
      setEditingId(null);
      setForm(EMPTY_GAME_FORM);
    },
    onError: (error) => setFormError(error.message)
  });

  const deleteMutation = useAdminMutation<void, number>({
    mutationFn: deleteGame,
    successMessage: "Jogo excluído com sucesso.",
    errorFallback: "Falha ao excluir jogo",
    invalidate: () => invalidate.games(),
    onSuccess: () => setConfirmDeleteId(null),
    onError: () => setConfirmDeleteId(null)
  });

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_GAME_FORM);
    setFormError("");
    setFormModalOpen(true);
  }

  function openEdit(game: GameResponse) {
    setEditingId(game.id);
    setForm({
      catId: game.catId,
      authorId: game.authorId,
      featured: game.featured,
      title: decodeHtmlEntities(game.title),
      description: game.description,
      coverImage: game.coverImage,
      fileType: game.fileType,
      fileUrl: game.fileUrl,
      status: game.status
    });
    setFormError("");
    setFormModalOpen(true);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.fileUrl.trim()) {
      setFormError("Título e URL do jogo são obrigatórios.");
      return;
    }
    saveMutation.mutate({ id: editingId, payload: form });
  }

  async function handleCover(file: File) {
    setUploadingCover(true);
    setFormError("");
    try {
      const uploaded = await uploadGameCover(file);
      setForm((prev) => ({ ...prev, coverImage: uploaded.filename }));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Falha no upload da capa");
    } finally {
      setUploadingCover(false);
    }
  }

  const columns = useMemo<DataTableColumn<GameResponse>[]>(
    () => [
      {
        key: "cover",
        label: "Capa",
        render: (game) => (
          <LegacyImage
            legacyPath={game.coverImage}
            alt={decodeHtmlEntities(game.title)}
            className="h-12 w-12 rounded-lg object-cover"
            fallbackClassName="grid h-12 w-12 place-items-center rounded-lg bg-violet-100 text-xs font-semibold text-violet-700"
            fallbackText="J"
          />
        )
      },
      { key: "title", label: "Título", render: (game) => decodeHtmlEntities(game.title) },
      { key: "type", label: "Tipo", render: (game) => game.fileType || "-" },
      {
        key: "status",
        label: "Status",
        render: (game) => <StatusBadge active={game.status === 1} />
      },
      {
        key: "actions",
        label: "",
        stopRowClick: true,
        render: (game) => (
          <TableRowActions>
            {canUpdate ? (
              <button type="button" className="table-btn icon" onClick={() => openEdit(game)}>
                <Pencil size={14} />
                Editar
              </button>
            ) : null}
            {canDelete ? (
              <button type="button" className="table-btn icon" onClick={() => setConfirmDeleteId(game.id)}>
                <Trash2 size={14} />
                Excluir
              </button>
            ) : null}
          </TableRowActions>
        )
      }
    ],
    [canDelete, canUpdate]
  );

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={
        <PageHeroStrip
          icon={Gamepad2}
          title="Jogos"
          description="Catálogo legado da tabela Jogos (Ludo e HTML)."
          actions={
            <PermissionGate permission="games.create">
              <Button onClick={openCreate}>
                <Plus size={16} />
                Novo jogo
              </Button>
            </PermissionGate>
          }
        />
      }
      stats={
        <ListingMiniStats
          items={[
            { label: "Total", value: games.length },
            { label: "Ativos", value: games.filter((g) => g.status === 1).length },
            { label: "Inativos", value: games.filter((g) => g.status === 0).length }
          ]}
        />
      }
    >
      <AdminListingSection<GameResponse>
        title="Listagem de jogos"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por título"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        columns={columns}
        data={filtered}
        loading={loading}
        keyExtractor={(game) => game.id}
        emptyMessage="Nenhum jogo encontrado"
        countLabel={`${filtered.length} jogo(s) com o filtro atual`}
        error={listingError}
      />

      <Modal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingId ? `Editar jogo #${editingId}` : "Novo jogo"}
        size="lg"
        closeOnOverlayClick={!saveMutation.isPending}
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          {formError ? <Alert>{formError}</Alert> : null}
          <Field label="Título" required>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="URL do jogo" required>
            <Input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
          </Field>
          <Field label="Categoria (cat_id)">
            <Input value={form.catId} onChange={(e) => setForm({ ...form, catId: e.target.value })} />
          </Field>
          <Field label="Tipo de arquivo">
            <Input value={form.fileType} onChange={(e) => setForm({ ...form, fileType: e.target.value })} />
          </Field>
          <Field label="Descrição">
            <textarea
              className="min-h-24 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Capa">
            <input
              type="file"
              accept="image/*"
              disabled={uploadingCover}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleCover(file);
                }
              }}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending || uploadingCover}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Excluir jogo"
        description="Esta ação remove o registro da tabela Jogos."
        confirmLabel="Excluir"
        onConfirm={() => confirmDeleteId !== null && deleteMutation.mutate(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </ListingPageShell>
  );
}
