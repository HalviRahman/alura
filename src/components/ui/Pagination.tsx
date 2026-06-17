import React from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  simple?: boolean
}

export default function Pagination({ page, totalPages, onChange, simple = false }: PaginationProps) {
  if (totalPages <= 1) return null

  if (simple) {
    return (
      <div className="flex justify-center items-center gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <span className="font-mono text-xs flex items-center px-2 text-on-surface-variant">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    )
  }

  // Numbered pages logic
  const pageRange = () => {
    const pages: number[] = []
    const start = Math.max(1, page - 3)
    const end = Math.min(totalPages, page + 2)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>
      
      {pageRange().map(pg => (
        <button
          key={pg}
          onClick={() => onChange(pg)}
          className={`w-8 h-8 flex items-center justify-center font-mono text-xs rounded-lg transition-colors ${
            pg === page
              ? 'bg-primary text-on-primary font-bold'
              : 'border border-outline-variant hover:bg-surface-container-high text-on-surface'
          }`}
        >
          {pg}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </div>
  )
}
