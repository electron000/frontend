import React from "react";
import './Pagination.css';

const Pagination = ({ currentPage, setPage, totalPages }) => {
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setPage(page);
    }
  };

  if (totalPages <= 1) return null;

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

      <button
        onClick={() => goToPage(1)}
        className={currentPage === 1 ? "active-page" : "PButtons"}
        aria-label="Page 1"
      >
        1
      </button>

      {totalPages > 5 && currentPage > 3 && (
        <span key="start-ellipsis" className="ellipsis">...</span>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((page) => {
          if (page === 1 || page === totalPages) return false;
          if (currentPage <= 3) return page <= 4;
          if (currentPage >= totalPages - 2) return page >= totalPages - 3;
          return Math.abs(page - currentPage) <= 1;
        })
        .map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={currentPage === page ? "active-page" : "PButtons"}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        ))}

      {totalPages > 5 && currentPage < totalPages - 2 && (
        <span key="end-ellipsis" className="ellipsis">...</span>
      )}

      <button
        onClick={() => goToPage(totalPages)}
        className={currentPage === totalPages ? "active-page" : "PButtons"}
        aria-label={`Page ${totalPages}`}
      >
        {totalPages}
      </button>

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