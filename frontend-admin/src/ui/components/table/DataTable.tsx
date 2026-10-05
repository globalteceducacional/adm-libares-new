import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Skeleton, TableSkeleton } from "../../../shared/ui";
import { TablePagination } from "./TablePagination";

export interface DataTableColumn<T = unknown> {
  key: string;
  label: ReactNode;
  renderTh?: () => ReactNode;
  thClassName?: string;
  tdClassName?: string;
  align?: "left" | "right" | "center";
  render?: (item: T) => ReactNode;
  stopRowClick?: boolean;
}

export type BulkAction = {
  label: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  onClick: (ids: (string | number)[]) => void;
};

type DataTableProps<T = unknown> = {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  /** Legenda da tabela (visualmente oculta) para leitores de tela. */
  caption?: ReactNode;
  emptyMessage?: string;
  /** Substitui `emptyMessage` por um bloco rico (ex.: `EmptyState` com CTA). */
  emptyState?: ReactNode;
  loading?: boolean;
  onRowClick?: (item: T, event?: MouseEvent<HTMLTableRowElement>) => void;
  rowClassName?: (item: T) => string;
  wrapperClassName?: string;
  tableClassName?: string;
  renderMobileCard?: (item: T) => ReactNode;
  paginate?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  /** Enable checkbox selection. */
  selectable?: boolean;
  /** Bulk actions shown when rows are selected. */
  bulkActions?: BulkAction[];
};

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center"
} as const;

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  caption,
  emptyMessage = "Nenhum registro encontrado",
  emptyState,
  loading = false,
  onRowClick,
  rowClassName,
  wrapperClassName = "",
  tableClassName = "",
  renderMobileCard,
  paginate = false,
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  selectable = false,
  bulkActions = []
}: DataTableProps<T>) {
  const hasMobileCards = Boolean(renderMobileCard);
  const colCount = selectable ? columns.length + 1 : columns.length;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const topScrollInnerRef = useRef<HTMLDivElement | null>(null);
  const [showTopScrollbar, setShowTopScrollbar] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    const syncState = () => {
      const tableEl = tableScrollRef.current;
      const topInnerEl = topScrollInnerRef.current;
      if (!tableEl || !topInnerEl) {
        setShowTopScrollbar(false);
        return;
      }

      const hasOverflow = tableEl.scrollWidth > tableEl.clientWidth + 1;
      setShowTopScrollbar(hasOverflow);
      topInnerEl.style.width = `${tableEl.scrollWidth}px`;
    };

    syncState();
    window.addEventListener("resize", syncState);
    const tableEl = tableScrollRef.current;
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => syncState()) : null;
    if (resizeObserver && tableEl) {
      resizeObserver.observe(tableEl);
    }
    return () => {
      window.removeEventListener("resize", syncState);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [data, columns, hasMobileCards]);

  const handleTopScroll = () => {
    const topEl = topScrollRef.current;
    const tableEl = tableScrollRef.current;
    if (!topEl || !tableEl) {
      return;
    }
    tableEl.scrollLeft = topEl.scrollLeft;
  };

  const handleTableScroll = () => {
    const topEl = topScrollRef.current;
    const tableEl = tableScrollRef.current;
    if (!topEl || !tableEl) {
      return;
    }
    topEl.scrollLeft = tableEl.scrollLeft;
  };

  const safePageSize = Math.max(1, pageSize);
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * safePageSize;
  const visibleData = paginate ? data.slice(startIndex, startIndex + safePageSize) : data;

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [data, paginate, pageSize]);

  const visibleKeys = visibleData.map((item) => keyExtractor(item));
  const allVisibleSelected =
    visibleKeys.length > 0 && visibleKeys.every((k) => selectedIds.has(k));
  const someVisibleSelected =
    !allVisibleSelected && visibleKeys.some((k) => selectedIds.has(k));

  function toggleRow(key: string | number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleKeys.forEach((k) => next.delete(k));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleKeys.forEach((k) => next.add(k));
        return next;
      });
    }
  }

  const selectedCount = selectedIds.size;

  const bulkActionBarEl =
    selectable && selectedCount > 0 && bulkActions.length > 0
      ? createPortal(
          <div className="bulk-action-bar" role="toolbar" aria-label="Ações em lote">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {selectedCount} selecionado{selectedCount !== 1 ? "s" : ""}
            </span>
            <div className="w-px h-5 bg-border" />
            {bulkActions.map((action, i) => (
              <button
                key={i}
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  action.variant === "danger"
                    ? "bg-danger/10 text-danger hover:bg-danger/20"
                    : action.variant === "primary"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-surface-2 text-foreground hover:bg-surface"
                }`}
                onClick={() => {
                  action.onClick(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
            <button
              type="button"
              className="text-xs text-muted hover:text-foreground ml-1"
              onClick={() => setSelectedIds(new Set())}
              aria-label="Limpar seleção"
            >
              ✕
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {hasMobileCards ? (
        <div className="dt-mobile-cards">
          {loading ? (
            <div className="dt-mobile-card-list" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full" />
              ))}
            </div>
          ) : visibleData.length === 0 ? (
            emptyState ?? <p className="muted-text">{emptyMessage}</p>
          ) : (
            <div className="dt-mobile-card-list">
              {visibleData.map((item) => {
                const rowKey = keyExtractor(item);
                const extraClass = rowClassName ? rowClassName(item) : "";
                const clickable = Boolean(onRowClick);
                return (
                  <div
                    key={rowKey}
                    className={`${clickable ? "dt-mobile-card-clickable" : ""} ${extraClass}`.trim()}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowClick(item);
                            }
                          }
                        : undefined
                    }
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                  >
                    {renderMobileCard ? renderMobileCard(item) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      <div className={hasMobileCards ? "dt-desktop-table" : ""}>
        <div
          className={`dt-top-scroll ${showTopScrollbar ? "visible" : "hidden"}`}
          ref={topScrollRef}
          onScroll={handleTopScroll}
        >
          <div ref={topScrollInnerRef} className="dt-top-scroll-inner" />
        </div>

        <div className={`table-scroll-shell ${wrapperClassName}`} ref={tableScrollRef} onScroll={handleTableScroll}>
          <table className={`table ${tableClassName}`} aria-busy={loading}>
            {caption ? <caption className="sr-only">{caption}</caption> : null}
            <thead>
              <tr>
                {selectable ? (
                  <th scope="col" style={{ width: 40 }} className="text-center">
                    <input
                      type="checkbox"
                      aria-label="Selecionar todos"
                      checked={allVisibleSelected}
                      ref={(el) => { if (el) el.indeterminate = someVisibleSelected; }}
                      onChange={toggleAll}
                    />
                  </th>
                ) : null}
                {columns.map((col) => {
                  if (col.renderTh) {
                    return col.renderTh();
                  }
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={`${alignClass[col.align ?? "left"]} ${col.thClassName ?? ""}`}
                    >
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colCount}>
                    <TableSkeleton rows={5} />
                  </td>
                </tr>
              ) : visibleData.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className={emptyState ? "!p-0" : undefined}>
                    {emptyState ?? emptyMessage}
                  </td>
                </tr>
              ) : (
                visibleData.map((item) => {
                  const rowKey = keyExtractor(item);
                  const extraClass = rowClassName ? rowClassName(item) : "";
                  const clickable = Boolean(onRowClick);
                  const isSelected = selectedIds.has(rowKey);
                  return (
                    <tr
                      key={rowKey}
                      className={`${clickable ? "dt-row-clickable" : ""} ${extraClass}${isSelected ? " bg-primary/[0.04]" : ""}`}
                      onClick={onRowClick ? (event) => onRowClick(item, event) : undefined}
                      tabIndex={clickable ? 0 : undefined}
                      onKeyDown={
                        clickable && onRowClick
                          ? (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onRowClick(item, event as unknown as MouseEvent<HTMLTableRowElement>);
                              }
                            }
                          : undefined
                      }
                      aria-label={clickable ? "Ver detalhes do registro" : undefined}
                    >
                      {selectable ? (
                        <td
                          className="text-center"
                          style={{ width: 40 }}
                          onClick={(e) => { e.stopPropagation(); toggleRow(rowKey); }}
                        >
                          <input
                            type="checkbox"
                            aria-label="Selecionar linha"
                            checked={isSelected}
                            onChange={() => toggleRow(rowKey)}
                          />
                        </td>
                      ) : null}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`${alignClass[col.align ?? "left"]} ${col.tdClassName ?? ""}`}
                          onClick={col.stopRowClick ? (event) => event.stopPropagation() : undefined}
                        >
                          {col.render ? col.render(item) : null}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {paginate && totalItems > 0 ? (
        <TablePagination
          totalItems={totalItems}
          page={currentPage}
          pageSize={safePageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={pageSizeOptions}
        />
      ) : null}
      {bulkActionBarEl}
    </>
  );
}
