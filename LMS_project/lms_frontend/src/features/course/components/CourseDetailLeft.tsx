import { BookOpen, CheckCircle, ChevronDown, ChevronUp, PlayCircle, Star } from "lucide-react";
import { useState } from "react";

export const CourseDetailLeft = ({ COURSE_DATA}: any) => {

    const [expandedChapters, setExpandedChapters] = useState<string[]>([COURSE_DATA.curriculum[0].id]);
    const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor'>('overview');

    const toggleChapter = (id: string) => {
        setExpandedChapters(prev => 
        prev.includes(id) ? prev.filter(chapId => chapId !== id) : [...prev, id]
        );
    };

      const handleLessonClick = (lessonId: string) => {
    // Nếu course paid mà chưa mua -> Paywall (M13). Ở đây mock chuyển trang
    console.log(`Maps to lesson: ${lessonId}`);
    // window.location.href = `/learn/${COURSE_DATA.slug}/lesson/${lessonId}`;
  };
    return (
        <div className="lg:col-span-2 space-y-8">
            
            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto hide-scrollbar">
              {[
                { id: 'overview', label: 'Tổng quan' },
                { id: 'curriculum', label: 'Nội dung khóa học' },
                { id: 'instructor', label: 'Giảng viên' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[400px]">
              
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-10 animate-fade-in">
                  <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Bạn sẽ học được gì?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {COURSE_DATA.outcomes.map((item: any, idx: any) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Mô tả chi tiết</h2>
                    <div className="text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                      <p>Tiếng Anh không khó, quan trọng là bạn có phương pháp học đúng và một lộ trình rõ ràng. Khóa học này được thiết kế dựa trên nguyên lý học ngôn ngữ tự nhiên, giúp bạn tiếp thu từ vựng và ngữ pháp thông qua ngữ cảnh thực tế thay vì nhồi nhét lý thuyết.</p>
                      <p>Xuyên suốt khóa học, bạn sẽ được tương tác trực tiếp với các bài tập phát âm được tích hợp AI, giúp nhận diện và sửa lỗi sai ngay lập tức.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CURRICULUM */}
              {activeTab === 'curriculum' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Chương trình giảng dạy</h2>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {COURSE_DATA.curriculum.length} chương • {COURSE_DATA.curriculum.reduce((acc: any, curr: any) => acc + curr.lessons.length, 0)} bài học
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
                    {COURSE_DATA.curriculum.map((chapter: any, index: any) => {
                      const isExpanded = expandedChapters.includes(chapter.id);
                      return (
                        <div key={chapter.id} className={`${index !== 0 ? 'border-t border-slate-200 dark:border-slate-700' : ''}`}>
                          {/* Chapter Header */}
                          <button
                            onClick={() => toggleChapter(chapter.id)}
                            className="w-full flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left"
                          >
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white">{chapter.title}</h3>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex gap-2">
                                <span>{chapter.lessons.length} bài học</span>
                                <span>•</span>
                                <span>{chapter.totalDuration}</span>
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </button>

                          {/* Lessons List (Expandable) */}
                          {isExpanded && (
                            <div className="p-2">
                              {chapter.lessons.map((lesson: any) => (
                                <div 
                                  key={lesson.id}
                                  onClick={() => handleLessonClick(lesson.id)}
                                  className="group flex justify-between items-center p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                    <PlayCircle className="w-4 h-4 shrink-0" />
                                    <span className="text-sm font-medium">{lesson.title}</span>
                                  </div>
                                  <span className="text-xs text-slate-400">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: INSTRUCTOR */}
              {activeTab === 'instructor' && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Giảng viên của bạn</h2>
                  <div className="flex flex-col md:flex-row gap-6">
                    <img src={COURSE_DATA.teacher.avatar} alt={COURSE_DATA.teacher.name} className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800" />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{COURSE_DATA.teacher.name}</h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-4">{COURSE_DATA.teacher.title}</p>
                      <div className="flex gap-4 mb-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Star className="w-4 h-4" /> 4.8 Điểm ĐG</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> 12 Khóa học</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{COURSE_DATA.teacher.bio}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
    )
}