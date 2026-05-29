import { useEffect } from 'react';
import { CheckCircle2} from 'lucide-react';
import { useLogout } from '../../features/auth/api';

export default function LogoutPage() {

  const {mutate: logout} = useLogout();

  useEffect(() => {
    logout();  
  }, []);


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-center transform transition-all animate-fade-in-up">
        
        {/* Icon & Title */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 p-4 rounded-full">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Đăng xuất thành công!
        </h2>

      </div>

      {/* CSS Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}