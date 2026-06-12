import { CheckCircle2, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import type { AdminStatusFilter } from "../../../types/adminList";
import { Alert, Card, CardHeader, SearchInput } from "../../../shared/ui";
import { cn } from "../../../shared/lib/cn";
import { DataTable, type DataTableColumn } from "../table/DataTable";

export type { AdminStatusFilter } from "../../../types/adminList";

export type AdminListingSectionProps<T> = {
  title: string;
  description?: string;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchAriaLabel?: string;
  statusFilter?: AdminStatusFilter;
  onStatusFilterChange?: (value: AdminStatusFilter) => void;
  statusAllLabel?: string;
  statusActiveLabel?: string;
  statusInactiveLabel?: string;
  columns: DataTableColumn<T>[];
  data: T[];
  loading: boolean;
  keyExtractor: (item: T) => string | number;
  emptyMessage: string;
  renderMobileCard?: (item: T) => ReactNode;
  countLabel: string;
  error?: string;
  success?: string;
  showStatusLegend?: boolean;
  legendActiveLabel?: string;
  legendInactiveLabel?: string;
  paginate?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
};

export function AdminListingSection<T>({
  title,
  description,
  search,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  statusFilter,
  onStatusFilterChange,
  statusAllLabel = "Todos os status",
  statusActiveLabel = "Ativos",
  statusInactiveLabel = "Inativos",
  columns,
  data,
  loading,
  keyExtractor,
  emptyMessage,
  renderMobileCard,
  countLabel,
  error,
  success,
  showStatusLegend = Boolean(onStatusFilterChange && statusFilter !== undefined),
  legendActiveLabel = "Ativo",
  legendInactiveLabel = "Inativo",
  paginate = true,
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100]
}: AdminListingSectionProps<T>) {
  const hasStatusFilter = Boolean(onStatusFilterChange && statusFilter !== undefined);

  return (
    <Card elevated padding="md" className="min-w-0">
      <CardHeader
        title={title}
        description={description}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <SearchInput
              className="w-full sm:w-[min(360px,70vw)]"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchAriaLabel ?? title}
            />
            {hasStatusFilter ? (
              <select
                className={cn(
                  "h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground",
                  "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                )}
                value={statusFilter}
                onChange={(event) =>
                  onStatusFilterChange!(event.target.value as AdminStatusFilter)
                }
              >
                <option value="all">{statusAllLabel}</option>
                <option value="1">{statusActiveLabel}</option>
                <option value="0">{statusInactiveLabel}</option>
              </select>
            ) : null}
          </div>
        }
      />

      {success ? <Alert tone="success" className="mb-3">{success}</Alert> : null}
      {error ? <Alert tone="danger" className="mb-3">{error}</Alert> : null}

      <DataTable<T>
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={keyExtractor}
        emptyMessage={emptyMessage}
        renderMobileCard={renderMobileCard}
        paginate={paginate}
        initialPageSize={initialPageSize}
        pageSizeOptions={pageSizeOptions}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>{countLabel}</span>
        {showStatusLegend ? (
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 size={14} className="text-success" />
              {legendActiveLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <XCircle size={14} className="text-danger" />
              {legendInactiveLabel}
            </span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
