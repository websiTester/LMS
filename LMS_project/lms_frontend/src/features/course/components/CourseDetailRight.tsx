import { Award, FileText, Infinity, MonitorPlay, PlayCircle } from "lucide-react";
import { formatPrice } from "../utils";
import { useState } from "react";

const CourseDetailRight = ({COURSE_DATA}: any) => {

    const [isEnrolling, setIsEnrolling] = useState(false);

    
  const handleCTA = async () => {
    if (COURSE_DATA.price === 0) {
      // Logic Đăng ký miễn phí (POST enrollment)
      setIsEnrolling(true);
      try {
        await new Promise(res => setTimeout(res, 1200)); // Mock API delay
        // Redirect tới bài học đầu tiên
        window.location.href = `/learn/${COURSE_DATA.slug}/lesson/${COURSE_DATA.curriculum[0].lessons[0].id}`;
      } catch (error) {
        console.error(error);
        setIsEnrolling(false);
      }
    } else {
      // Logic Mua khóa học (Placeholder M4 -> Active M12)
      alert('Chức năng thanh toán đang được phát triển (Sẽ mở ở M12).');
    }
  };


    return ( 
         <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transform lg:-translate-y-40 transition-transform">
              {/* Thumbnail */}
              <div className="w-full aspect-video hidden lg:block bg-slate-200 relative">
                <img src={COURSE_DATA.thumbnail} alt="Course Thumbnail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white opacity-80" />
                </div>
              </div>

              <div className="p-6">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
                  {formatPrice(COURSE_DATA.price)}
                </div>

                <button
                  onClick={handleCTA}
                  disabled={isEnrolling}
                  className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-600/30"
                >
                  {isEnrolling ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : COURSE_DATA.price === 0 ? 'Đăng ký học miễn phí' : 'Mua ngay'}
                </button>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                  Đảm bảo hoàn tiền trong 30 ngày
                </p>

                <div className="mt-8 space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Khóa học này bao gồm:</h4>
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-3"><MonitorPlay className="w-4 h-4" /> 12.5 giờ video on-demand</li>
                    <li className="flex items-center gap-3"><FileText className="w-4 h-4" /> 45 tài liệu tải xuống</li>
                    <li className="flex items-center gap-3"><Infinity className="w-4 h-4" /> Quyền truy cập trọn đời</li>
                    <li className="flex items-center gap-3"><Award className="w-4 h-4" /> Chứng nhận hoàn thành</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
     );
}
 
export default CourseDetailRight;