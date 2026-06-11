import { 
  BookOpen, 
  Globe, 
  BarChart, 
  DollarSign, 
  Upload, 
  Check,
  Bold,
  Italic,
  List,
  Link as LinkIcon
} from 'lucide-react';
import { createCourseSchema, type CreateCourseFormData } from '../schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCreateCourse, useGetCourseById, useUpdateCourse } from '../api';
import { useNavigate, useParams } from 'react-router-dom';

export default function FormCourseWizard() {

  const {course_id} = useParams(); //nếu có courseId thì là edit, không có thì là create mới
  const isEditMode = Boolean(course_id);

  
  const {data: courseData, isLoading} = useGetCourseById(Number(course_id), isEditMode);
  console.log('Course data for editing:', courseData);
  
  const navigate = useNavigate();

  const {register, handleSubmit, watch, formState:{
    errors, isSubmitting
  }} = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    values: courseData ? {
      title: courseData.title,
      thumbnail: courseData.thumbnail,
      target_language: courseData.target_language,
      level: courseData.level,
      price: courseData.price,
      is_free: courseData.is_free,
      description: courseData.description || '', //thêm description vào default values nếu có trong courseData, nếu không có thì để trống
    }: {
      title: '',
      thumbnail: null,
      target_language: '',
      level: 'beginner',
      price: 0,
      is_free: false,
      description: '',
    }
  })

  const {mutate: createCourse } = useCreateCourse();
  const {mutate: updateCourse } = useUpdateCourse();
  const isFree = watch('is_free'); //theo dõi giá trị của trường is_free để hiển thị/ẩn trường price tương ứng

  const onSubmit = async (data: CreateCourseFormData) => {
    console.log('Form data:', data);
    if(isEditMode){
      updateCourse({courseId: Number(course_id), courseData: data}, {
        onSuccess: (result) => {
          console.log('Course updated successfully:', result);
          navigate('/teacher/courses');
        },
        onError: (error: any) => {
          console.error('Error updating course:', error);
        }
      })
    } else {
      createCourse(data, {
      onSuccess: (result) => {
        console.log('Course created successfully:', result);
        navigate('/teacher/courses');
      },
      onError: (error: any) => {
        console.error('Error creating course:', error);
      }
    })
    }
    
  
  }

  if(isEditMode && isLoading){
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    )
  }

  return (
    // Outer container (Full height của màn hình hoặc parent)
    <div className="h-screen bg-slate-50 dark:bg-slate-900 py-6 px-4 sm:px-6 lg:px-8 flex flex-col">
      
      {/* Header (Giữ cố định không scroll) */}
      <div className="max-w-3xl mx-auto w-full mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Tạo khóa học mới
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Điền các thông tin cơ bản dưới đây để bắt đầu xây dựng khóa học của bạn.
        </p>
      </div>

      {/* Vùng Scrollbar tùy chỉnh cho Form */}
      <div className="max-w-3xl mx-auto w-full flex-1 overflow-y-auto pr-2 pb-10 
        [&::-webkit-scrollbar]:w-2 
        [&::-webkit-scrollbar-track]:bg-transparent 
        [&::-webkit-scrollbar-thumb]:bg-slate-300 
        [&::-webkit-scrollbar-thumb]:dark:bg-slate-600 
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-slate-400
      ">
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Tên khóa học <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="title"
                  required
                  {...register('title')}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-slate-900 dark:text-white sm:text-sm transition-colors outline-none"
                  placeholder="VD: Tiếng Anh giao tiếp cho người mới bắt đầu"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Target Language Field */}
              <div>
                <label htmlFor="target_language" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ngôn ngữ mục tiêu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    id="target_language"
                    required
                    {...register('target_language')}
                    className="block w-full pl-11 pr-10 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-slate-900 dark:text-white sm:text-sm appearance-none transition-colors outline-none"
                  >
                    <option value="" className="dark:bg-slate-800">Chọn ngôn ngữ</option>
                    <option value="en" className="dark:bg-slate-800">Tiếng Anh</option>
                    <option value="ja" className="dark:bg-slate-800">Tiếng Nhật</option>
                    <option value="ko" className="dark:bg-slate-800">Tiếng Hàn</option>
                    <option value="zh" className="dark:bg-slate-800">Tiếng Trung</option>
                  </select>
                </div>
              </div>

              {/* Level Field */}
              <div>
                <label htmlFor="level" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Trình độ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <BarChart className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    id="level"
                    required
                    {...register('level')}
                    className="block w-full pl-11 pr-10 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-slate-900 dark:text-white sm:text-sm appearance-none transition-colors outline-none"
                  >
                    <option value="" className="dark:bg-slate-800">Chọn trình độ</option>
                    <option value="beginner" className="dark:bg-slate-800">Cơ bản</option>
                    <option value="intermediate" className="dark:bg-slate-800">Trung cấp</option>
                    <option value="advanced" className="dark:bg-slate-800">Cao cấp</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Khóa học miễn phí</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Học viên có thể tham gia mà không cần thanh toán.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input {...register('is_free')} type="checkbox" className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {!isFree && (
                <div>
                <label htmlFor="price" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Giá khóa học (VNĐ)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    id="price"
                    className="block w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent text-slate-900 dark:text-white sm:text-sm transition-colors outline-none"
                    placeholder="VD: 599000"
                  />
                </div>
              </div>
              )}
            </div>

            {/* Thumbnail Field (Upload UI) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Ảnh bìa (Thumbnail) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-7 pb-8 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                <div className="space-y-3 text-center">
                  <div className="mx-auto h-14 w-14 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Upload className="h-7 w-7" />
                  </div>
                  <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                    <span className="relative rounded-md font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      Tải ảnh lên
                    </span>
                    <p className="pl-1">hoặc kéo thả vào đây</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    PNG, JPG, WEBP tối đa 5MB (Tỉ lệ 16:9)
                  </p>
                </div>
              </div>
            </div>

            {/* UPGRADED: Description Field with Fake Toolbar */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Mô tả chi tiết <span className="text-slate-400 font-normal">(Description)</span>
              </label>
              <div className="border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors bg-white dark:bg-transparent">
                
                {/* Fake Toolbar */}
                <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 px-3 py-2 flex items-center gap-1">
                  <button type="button" className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"><Bold className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"><Italic className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                  <button type="button" className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"><List className="w-4 h-4" /></button>
                  <button type="button" className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"><LinkIcon className="w-4 h-4" /></button>
                </div>
                
                {/* Textarea */}
                <textarea
                  id="description"
                  {...register('description')}
                  rows={6}
                  className="block w-full p-4 bg-transparent text-slate-900 dark:text-white sm:text-sm resize-y outline-none"
                  placeholder="Khóa học này bao gồm những nội dung gì? Học viên sẽ nhận được gì sau khóa học?..."
                />
              </div>
            </div>
            
          </div>
          
          {/* Footer Actions (Cố định ở dưới form) */}
          <div className="px-6 sm:px-8 py-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
            <button
              type="button"
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Đang lưu...' : 'Lưu khóa học'}
            </button>

            {errors && (
              <div className="ml-4 text-sm text-red-600">
                {Object.values(errors).map((error, index) => (
                  <p key={index}>{error.message}</p>
                ))}
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}