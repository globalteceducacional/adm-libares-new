import { CheckCircle2, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import type { AdminStatusFilter } from "../../../types/adminList";
import { Alert, Card, CardHeader, SearchInput } from "../../../shared/ui";
import { BerrySelect } from "./BerrySelect";
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
  onRowClick?: (item: T) => void;
  secondaryFilter?: ReactNode;
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
  pageSizeOptions = [10, 20, 50, 100],
  onRowClick,
  secondaryFilter
}: AdminListingSectionProps<T>) {
  const hasStatusFilter = Boolean(onStatusFilterChange && statusFilter !== undefined);

  return (
    <Card elevated padding="md" className="berry-listing-section min-w-0">
      <CardHeader
        title={<span className="font-display text-base font-semibold">{title}</span>}
        description={description}
      />

      <div className="berry-listing-toolbar mb-4 flex flex-col gap-3 rounded-xl border border-border bg-surface-2/60 p-3 sm:flex-row sm:flex-wrap sm:items-end">
        <SearchInput
          className="w-full sm:min-w-[220px] sm:flex-1 sm:max-w-md"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel ?? title}
        />
        {hasStatusFilter ? (
          <BerrySelect
            label="Status"
            value={statusFilter}
            aria-label="Filtrar por status"
            onChange={(event) =>
              onStatusFilterChange!(event.target.value as AdminStatusFilter)
            }
          >
            <option value="all">{statusAllLabel}</option>
            <option value="1">{statusActiveLabel}</option>
            <option value="0">{statusInactiveLabel}</option>
          </BerrySelect>
        ) : null}
        {secondaryFilter}
      </div>

      {success ? <Alert tone="success" className="mb-3">{success}</Alert> : null}
      {error ? <Alert tone="danger" className="mb-3">{error}</Alert> : null}
      {onRowClick && !loading && data.length > 0 ? (
        <p className="mb-3 text-xs text-muted">Clique em um registro para ver os detalhes.</p>
      ) : null}

      <DataTable<T>
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={keyExtractor}
        caption={title}
        emptyMessage={emptyMessage}
        renderMobileCard={renderMobileCard}
        onRowClick={onRowClick}
        paginate={paginate}
        initialPageSize={initialPageSize}
        pageSizeOptions={pageSizeOptions}
        tableClassName="berry-table"
        wrapperClassName="berry-table-shell"
      />

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
