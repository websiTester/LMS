import { AlertTriangle } from "lucide-react";

export const ErrorMessage = ({ error }: { error: Error }) => {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Có lỗi xảy ra</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
          {error.message}
        </p>
      </div>
    );
}