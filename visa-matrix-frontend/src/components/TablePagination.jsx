import React from "react";
export default function TablePagination({
  page,
  pageCount,
  onPrevious,
  onNext,
  itemLabel = "records",
}) {
  return (
    <div className="pagination">
      <span className="pagination__info">
        Page {page} of {pageCount} for {itemLabel}
      </span>
      <div className="button-row">
        <button
          className="secondary-button"
          disabled={page <= 1}
          onClick={onPrevious}
          type="button"
        >
          Previous
        </button>
        <button
          className="secondary-button"
          disabled={page >= pageCount}
          onClick={onNext}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
