import { Link } from "react-router-dom"
import type { CourseRead } from "../type"
import { LazyImage } from "../../../shared/components/LazyImage"
import { formatPrice, getLevelColor } from "../utils"



export const CourseCard = ({ course }: { course: CourseRead }) => {
    return (
         <Link
                key={course.id}
                to={`/courses/${course.slug}`} // Sẽ dùng <Link> nếu dùng Next.js / React Router
                className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Thumbnail (Lazy Loaded) */}
                <LazyImage src={course.thumbnail} alt={course.title} />

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Badge */}
                  <div className="mb-3">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  {/* Footer: Teacher & Price */}
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img 
                        src={course.teacherAvatar} 
                        alt={course.teacherName} 
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                      />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-1">
                        {course.teacherName}
                      </span>
                    </div>
                    <div className={`text-base font-bold ${course.price === 0 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {formatPrice(course.price)}
                    </div>
                  </div>
                </div>
              </Link>
    )
}