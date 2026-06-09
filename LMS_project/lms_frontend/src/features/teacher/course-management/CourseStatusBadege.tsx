import { AlertCircle, Archive, BookOpen, CheckCircle, Trash2 } from "lucide-react";

const CourseStatusBadge = ({ status }: { status: string }) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
        case 'published': 
            return { label: 'Đã xuất bản', style: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50', Icon: CheckCircle };
        case 'draft': 
            return { label: 'Bản nháp', style: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700', Icon: BookOpen };
        case 'rejected': 
            return { label: 'Bị từ chối', style: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50', Icon: AlertCircle };
        case 'archived':
            return { label: 'Lưu trữ', style: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50', Icon: Archive };
        case 'deleted':
            return { label: 'Đã xóa', style: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700', Icon: Trash2 };
        default:
            return { label: status, style: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700', Icon: BookOpen };
        }
  };
  const badge = getStatusBadge(status);
  const StatusIcon = badge.Icon;
    return ( 
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.style}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>
     );
}
 
export default CourseStatusBadge;