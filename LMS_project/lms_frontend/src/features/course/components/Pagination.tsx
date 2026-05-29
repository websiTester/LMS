import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    page: number;
    totalPages: number;
    setPage: (page: number) => void;
    isPending: boolean;
}

export const Pagination = ({ page, totalPages, setPage, isPending }: PaginationProps) => {
   return (
     <div className="mt-12 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-6">
          <div className="hidden sm:block text-sm text-slate-600 dark:text-slate-400">
            Hiển thị trang <span className="font-semibold text-slate-900 dark:text-white">{page}</span> / <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
          </div>
          
          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isPending}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isPending}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Tiếp
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
   )

}