import { motion } from "framer-motion";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getQueryErrorMessage, useAuditQuery } from "../../features/shared/api/queries";
import { buildBreadcrumbs } from "../../features/layout/config/navigation";
import type {
  AuditActorActivityRow,
  AuditConsistencyRow,
  AuditModuleSummaryRow,
  AuditOverviewResponse,
  AuditSoftDeleteRow
} from "../../types/audit";
import { DataTable, type DataTableColumn } from "../components/table/DataTable";
import { Alert, PageShell, Skeleton, TableSkeleton } from "../../shared/ui";

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

  const auditShell = {
    title: "Auditoria",
    description: "Exclusoes logicas recentes, atividade por ator e consistencia dos dados.",
    breadcrumbs: buildBreadcrumbs(location.pathname)
  };

  if (loading) {
    return (
      <PageShell {...auditShell}>
        <motion.div
          className="books-page-stack"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          aria-busy="true"
          aria-label="Carregando auditoria"
        >
          <article className="card page-card elevated">
            <Skeleton className="h-4 w-64" />
          </article>
          <article className="card page-card elevated">
            <TableSkeleton rows={4} />
          </article>
          <article className="card page-card elevated">
            <TableSkeleton rows={6} />
          </article>
        </motion.div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell {...auditShell}>
        <Alert tone="danger">{error}</Alert>
      </PageShell>
    );
  }

  if (!data) {
    return null;
  }

  if (!data.ok) {
    return (
      <PageShell {...auditShell}>
        <Alert tone="warning">
          Base adm_libare_core, modo core e views de auditoria sao necessarios para esta pagina.
        </Alert>
        <p className="error-text">{auditReasonMessage(data.reason)}</p>
      </PageShell>
    );
  }

  return (
    <PageShell {...auditShell}>
      <motion.div
        className="books-page-stack"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
      <article className="card page-card elevated">
        <div className="card-header">
          <h2>Resumo por modulo</h2>
        </div>
        <DataTable<AuditModuleSummaryRow>
          columns={moduleColumns}
          data={data.moduleSummary}
          keyExtractor={(row) => row.moduleName}
          emptyMessage="Nenhum registo nas views de resumo."
        />
      </article>

      <article className="card page-card elevated">
        <div className="card-header">
          <h2>Ultimas exclusoes logicas (ate 100)</h2>
        </div>
        <DataTable<AuditSoftDeleteRow>
          columns={softDeleteColumns}
          data={data.recentSoftDeletes}
          keyExtractor={(row) => `${row.moduleName}|${row.entityId}|${row.deletedAt ?? ""}`}
          emptyMessage="Nenhuma exclusao logica encontrada."
        />
      </article>

      <div className="chart-grid">
        <article className="card page-card elevated">
          <div className="card-header">
            <h2>Atividade por ator (updated_by)</h2>
          </div>
          <DataTable<AuditActorActivityRow>
            columns={actorColumns}
            data={data.actorActivity}
            keyExtractor={(row) => String(row.actorId)}
            emptyMessage="Nenhum historico de updated_by."
          />
        </article>

        <article className="card page-card elevated">
          <div className="card-header">
            <h2>Consistencia de soft delete</h2>
          </div>
          <DataTable<AuditConsistencyRow>
            columns={consistencyColumns}
            data={data.softDeleteConsistency}
            keyExtractor={(row) => row.checkName}
            emptyMessage="Sem checagens."
          />
        </article>
      </div>
      </motion.div>
    </PageShell>
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
