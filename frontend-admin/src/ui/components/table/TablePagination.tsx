type TablePaginationProps = {
  totalItems: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
};

export function TablePagination({
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100]
}: TablePaginationProps) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const end = Math.min(currentPage * safePageSize, totalItems);

  return (
    <div className="dt-pagination">
      <span className="dt-pagination-info">
        Exibindo {start}-{end} de {totalItems}
      </span>
      <div className="dt-pagination-controls">
        <select
          value={safePageSize}
          aria-label="Itens por pagina"
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}/pg
            </option>
          ))}
        </select>
        <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
          Anterior
        </button>
        <span>
          {currentPage}/{totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Proxima
        </button>
      </div>
    </div>
  );
}
