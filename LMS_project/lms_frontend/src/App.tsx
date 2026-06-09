import {  BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/public/LandingPage';
import Notfound from './shared/components/Notfound';
import Register from './pages/public/Register';
import Login from './pages/public/Login';
import StudentDashBoardPage from './pages/student/DashboardPage';
import CourseList from './pages/public/CourseListPage';
import CourseDetailPage from './pages/public/CourseDetailPage';
import AdminDashboard from './features/admin/components/AdminDashboard';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import GuestRoute from './shared/components/GuestRoute';
import InitAuth from './shared/components/InitAuth';
import Unauthorized from './shared/components/Unauthorized';
import UserManagement from './features/admin/user-management/components/user-list/UserManagement';
import AdminLayout from './features/admin/components/AdminLayout';
import LogoutPage from './pages/public/Logout';
import UserDetail from './features/admin/user-management/components/user-detail/UserDetail';
import TeacherDashboard from './features/teacher/components/TeacherDashboard';
import TeacherCoursesList from './features/teacher/course-management/MyCourseClass';
import TeacherLayout from './features/teacher/components/TeacherLayout';
import FormCourseWizard from './features/teacher/course-management/FormCourseWizard';
function App() {


  return (
    <>
        <BrowserRouter>
          <Routes>
            <Route element={<InitAuth />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/coursesList" element={<CourseList />} />
              <Route path="/courses/:slug" element={<CourseDetailPage />} />
              <Route path="/403-unauthorized" element={<Unauthorized />} />
              <Route path="/logout" element={<LogoutPage />} />


              <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Register />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student/dashboard" element={<StudentDashBoardPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="users/:id" element={<UserDetail />} />
                </Route>
              </Route>


              <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                <Route path="/teacher" element={<TeacherLayout/>}>
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="courses" element={<TeacherCoursesList />} />
                <Route path="courses/create" element={<FormCourseWizard />} />
                <Route path="courses/:course_id/edit" element={<FormCourseWizard />} />
                </Route>
              </Route>

              <Route path="*" element={<Notfound/>} />
           
            </Route>
            
          </Routes>
        </BrowserRouter>
    </>
  )
}

export default App
