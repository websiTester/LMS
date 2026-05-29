export const CourseSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
    <div className="w-full aspect-video bg-slate-200 dark:bg-slate-700"></div>
    <div className="p-5 flex-1 flex flex-col">
      <div className="w-20 h-5 bg-slate-200 dark:bg-slate-700 rounded-full mb-3"></div>
      <div className="w-full h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
      <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
  </div>
);