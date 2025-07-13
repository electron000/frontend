import React from "react";

const Pagination = ({ currentPage, setPage, totalPages, rowsPerPage, currentData }) => {
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setPage(page);
    }
  };

  if (totalPages <= 0) return <p className="no-data">No Data Found</p>;

  return (
    <div className="pagination">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="PNpage"
        aria-label="Previous Page"
      >
        ◀
      </button>

      {/* First Page */}
      <button
        onClick={() => goToPage(1)}
        className={currentPage === 1 ? "active-page" : "PButtons"}
        aria-label="Page 1"
      >
        1
      </button>

      {/* Left Ellipsis */}
      {totalPages > 5 && currentPage > 3 && (
        <span key="start-ellipsis" className="ellipsis">...</span>
      )}

      {/* Dynamic middle pages */}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((page) => {
          if (currentPage <= 3) return page >= 2 && page <= 4;
          if (currentPage >= totalPages - 2) return page >= totalPages - 3 && page < totalPages;
          return Math.abs(page - currentPage) <= 1;
        })
        .map((page) =>
          page !== 1 && page !== totalPages ? (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={currentPage === page ? "active-page" : "PButtons"}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          ) : null
        )}

      {/* Right Ellipsis */}
      {totalPages > 5 && currentPage < totalPages - 2 && (
        <span key="end-ellipsis" className="ellipsis">...</span>
      )}

      {/* Last Page */}
      {totalPages > 1 && (
        <button
          onClick={() => goToPage(totalPages)}
          className={currentPage === totalPages ? "active-page" : "PButtons"}
          aria-label={`Page ${totalPages}`}
        >
          {totalPages}
        </button>
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="PNpage"
        aria-label="Next Page"
      >
      ▶
      </button>
    </div>

    
  );
};

export default Pagination;