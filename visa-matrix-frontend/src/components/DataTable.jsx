import React from "react";
export default function DataTable({
  columns,
  rows,
  rowKey = "id",
  emptyMessage = "No records available.",
  caption,
  onRowClick,
}) {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  const resolveRowKey = (row, index) => {
    if (typeof rowKey === "function") {
      return rowKey(row, index);
    }

    return row[rowKey] ?? `${index}`;
  };

  return (
    <div className="table-shell">
      <table className="data-table">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {safeColumns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeRows.length > 0 ? (
            safeRows.map((row, index) => (
              <tr
                className={onRowClick ? "data-table__row--clickable" : undefined}
                key={resolveRowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {safeColumns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="data-table__empty" colSpan={safeColumns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
