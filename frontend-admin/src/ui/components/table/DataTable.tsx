import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react";
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

type DataTableProps<T = unknown> = {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  /** Legenda da tabela (visualmente oculta) para leitores de tela. */
  caption?: ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T, event?: MouseEvent<HTMLTableRowElement>) => void;
  rowClassName?: (item: T) => string;
  wrapperClassName?: string;
  tableClassName?: string;
  renderMobileCard?: (item: T) => ReactNode;
  paginate?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
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
  loading = false,
  onRowClick,
  rowClassName,
  wrapperClassName = "",
  tableClassName = "",
  renderMobileCard,
  paginate = false,
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100]
}: DataTableProps<T>) {
  const hasMobileCards = Boolean(renderMobileCard);
  const colCount = columns.length;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const topScrollRef = useRef<HTMLDivElement | null>(null);
  const topScrollInnerRef = useRef<HTMLDivElement | null>(null);
  const [showTopScrollbar, setShowTopScrollbar] = useState(false);

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
  }, [data, paginate, pageSize]);

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
            <p className="muted-text">{emptyMessage}</p>
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
                  <td colSpan={colCount}>{emptyMessage}</td>
                </tr>
              ) : (
                visibleData.map((item) => {
                  const rowKey = keyExtractor(item);
                  const extraClass = rowClassName ? rowClassName(item) : "";
                  const clickable = Boolean(onRowClick);
                  return (
                    <tr
                      key={rowKey}
                      className={`${clickable ? "dt-row-clickable" : ""} ${extraClass}`}
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
    </>
  );
}
