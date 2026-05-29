import { Star } from "lucide-react"


export const CourseHero = ({COURSE_DATA}: { COURSE_DATA: any }) => {
    return (
        <div className="bg-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30">
                {COURSE_DATA.level}
              </span>
              <span className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                {COURSE_DATA.rating} ({COURSE_DATA.totalStudents.toLocaleString()} học viên)
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              {COURSE_DATA.title}
            </h1>
            
            <p className="text-lg text-slate-300 max-w-3xl">
              {COURSE_DATA.shortDesc}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <img src={COURSE_DATA.teacher.avatar} alt={COURSE_DATA.teacher.name} className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover" />
              <div>
                <p className="text-sm text-slate-400">Giảng viên</p>
                <p className="font-semibold">{COURSE_DATA.teacher.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}