import { motion } from "framer-motion";
import { ClipboardList, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getQueryErrorMessage, useAuditQuery } from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import type {
  AuditActorActivityRow,
  AuditConsistencyRow,
  AuditModuleSummaryRow,
  AuditSoftDeleteRow
} from "../../types/audit";
import { ListingMiniStats } from "../components/layout/ListingMiniStats";
import { ListingPageShell } from "../components/layout/ListingPageShell";
import { PageHeroStrip } from "../components/layout/PageHeroStrip";
import { DataTable, type DataTableColumn } from "../components/table/DataTable";
import { Alert, Button, Card, CardHeader, Skeleton, TableSkeleton } from "../../shared/ui";

function auditReasonMessage(reason: string | undefined | null): string {
  switch (reason) {
    case "CORE_MODE_REQUIRED":
      return "Ative APP_DATA_MODE=core e use a base adm_libare_core (ver README).";
    case "AUDIT_VIEWS_MISSING":
      return "Execute no MySQL o script scripts/migration/012_audit_views.sql.";
    case "AUDIT_QUERY_FAILED":
      return "Nao foi possivel ler as views de auditoria. Verifique logs do backend e o MySQL.";
    default:
      return reason?.trim() ? reason : "Auditoria indisponivel.";
  }
}

export function AuditPage() {
  const location = useLocation();
  const auditQuery = useAuditQuery();
  const data = auditQuery.data ?? null;
  const loading = auditQuery.isLoading;
  const error = auditQuery.error
    ? getQueryErrorMessage(auditQuery.error, "Falha ao carregar auditoria")
    : "";

  const listStats = useMemo(() => {
    if (!data?.ok) {
      return [
        { label: "Modulos", value: 0 },
        { label: "Registos totais", value: 0 },
        { label: "Soft-deletes", value: 0 },
        { label: "Exclusoes listadas", value: 0 }
      ];
    }
    const totalRows = data.moduleSummary.reduce((sum, row) => sum + row.totalRows, 0);
    const softDeleted = data.moduleSummary.reduce((sum, row) => sum + row.softDeletedRows, 0);
    return [
      { label: "Modulos", value: data.moduleSummary.length },
      { label: "Registos totais", value: totalRows },
      { label: "Soft-deletes", value: softDeleted },
      { label: "Exclusoes listadas", value: data.recentSoftDeletes.length }
    ];
  }, [data]);

  const moduleColumns = useMemo<DataTableColumn<AuditModuleSummaryRow>[]>(
    () => [
      { key: "module", label: "Modulo", render: (row) => row.moduleName },
      {
        key: "total",
        label: "Total",
        align: "right",
        render: (row) => row.totalRows.toLocaleString("pt-BR")
      },
      {
        key: "active",
        label: "Ativos",
        align: "right",
        render: (row) => row.activeRows.toLocaleString("pt-BR")
      },
      {
        key: "soft",
        label: "Excluidos (logico)",
        align: "right",
        render: (row) => row.softDeletedRows.toLocaleString("pt-BR")
      }
    ],
    []
  );

  const softDeleteColumns = useMemo<DataTableColumn<AuditSoftDeleteRow>[]>(
    () => [
      { key: "mod", label: "Modulo", render: (row) => row.moduleName },
      { key: "id", label: "ID", render: (row) => row.entityId },
      { key: "label", label: "Descricao", render: (row) => row.entityLabel ?? "—" },
      {
        key: "by",
        label: "Excluido por (id)",
        align: "right",
        render: (row) => (row.deletedBy != null ? String(row.deletedBy) : "—")
      },
      { key: "at", label: "Data", render: (row) => formatInstant(row.deletedAt) }
    ],
    []
  );

  const actorColumns = useMemo<DataTableColumn<AuditActorActivityRow>[]>(
    () => [
      {
        key: "actor",
        label: "ID ator (admin)",
        align: "right",
        render: (row) => row.actorId.toLocaleString("pt-BR")
      },
      {
        key: "changes",
        label: "Alteracoes (updated_by)",
        align: "right",
        render: (row) => row.totalChanges.toLocaleString("pt-BR")
      }
    ],
    []
  );

  const consistencyColumns = useMemo<DataTableColumn<AuditConsistencyRow>[]>(
    () => [
      { key: "check", label: "Verificacao", render: (row) => row.checkName },
      {
        key: "count",
        label: "Inconsistencias",
        align: "right",
        render: (row) => row.invalidCount.toLocaleString("pt-BR")
      }
    ],
    []
  );

  const hero = (
    <PageHeroStrip
      icon={ClipboardList}
      title="Auditoria"
      description="Exclusoes logicas recentes, atividade por ator e consistencia dos dados."
      tone="info"
      actions={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={auditQuery.isLoading || auditQuery.isFetching}
          onClick={() => {
            void auditQuery.refetch();
          }}
        >
          <RefreshCw size={16} />
          Atualizar
        </Button>
      }
    />
  );

  if (loading) {
    return (
      <ListingPageShell
        breadcrumbs={buildBreadcrumbs(location.pathname)}
        hero={hero}
        stats={<ListingMiniStats items={listStats} />}
      >
        <div className="space-y-4" aria-busy="true" aria-label="Carregando auditoria">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <TableSkeleton rows={5} />
          <TableSkeleton rows={5} />
        </div>
      </ListingPageShell>
    );
  }

  if (error) {
    return (
      <ListingPageShell
        breadcrumbs={buildBreadcrumbs(location.pathname)}
        hero={hero}
        stats={<ListingMiniStats items={listStats} />}
      >
        <Alert tone="danger">{error}</Alert>
      </ListingPageShell>
    );
  }

  if (!data) {
    return null;
  }

  if (!data.ok) {
    return (
      <ListingPageShell
        breadcrumbs={buildBreadcrumbs(location.pathname)}
        hero={hero}
        stats={<ListingMiniStats items={listStats} />}
      >
        <Alert tone="warning">
          Base adm_libare_core, modo core e views de auditoria sao necessarios para esta pagina.
        </Alert>
        <p className="mt-2 text-sm text-muted">{auditReasonMessage(data.reason)}</p>
      </ListingPageShell>
    );
  }

  return (
    <ListingPageShell
      breadcrumbs={buildBreadcrumbs(location.pathname)}
      hero={hero}
      stats={<ListingMiniStats items={listStats} />}
    >
      <motion.div
        className="space-y-4 md:space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <Card elevated padding="lg">
          <CardHeader title="Resumo por modulo" />
          <DataTable<AuditModuleSummaryRow>
            columns={moduleColumns}
            data={data.moduleSummary}
            keyExtractor={(row) => row.moduleName}
            emptyMessage="Nenhum registo nas views de resumo."
          />
        </Card>

        <Card elevated padding="lg">
          <CardHeader
            title="Ultimas exclusoes logicas"
            description="Ate 100 registos mais recentes"
          />
          <DataTable<AuditSoftDeleteRow>
            columns={softDeleteColumns}
            data={data.recentSoftDeletes}
            keyExtractor={(row) => `${row.moduleName}|${row.entityId}|${row.deletedAt ?? ""}`}
            emptyMessage="Nenhuma exclusao logica encontrada."
          />
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card elevated padding="lg" className="min-w-0">
            <CardHeader title="Atividade por ator" description="Contagem via updated_by" />
            <DataTable<AuditActorActivityRow>
              columns={actorColumns}
              data={data.actorActivity}
              keyExtractor={(row) => String(row.actorId)}
              emptyMessage="Nenhum historico de updated_by."
            />
          </Card>

          <Card elevated padding="lg" className="min-w-0">
            <CardHeader title="Consistencia de soft delete" />
            <DataTable<AuditConsistencyRow>
              columns={consistencyColumns}
              data={data.softDeleteConsistency}
              keyExtractor={(row) => row.checkName}
              emptyMessage="Sem checagens."
            />
          </Card>
        </div>
      </motion.div>
    </ListingPageShell>
  );
}

function formatInstant(value: string | null): string {
  if (!value) {
    return "—";
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return value;
  }
  return d.toLocaleString("pt-BR", { timeZone: "UTC" });
}
