// src/App.tsx — VERSION AVEC StudentLayout (espace étudiant avec sidebar)
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { PermissionProvider } from './contexts/PermissionContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Pages publiques
import Home from './pages/Home/Home';
import Contact from './pages/Contact/Contact';
import ContactSuccess from './pages/Contact/ContactSuccess';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';
import About from './pages/About/About';
import Pricing from './pages/Pricing/Pricing';
import BecomeInstructor from './pages/BecomeInstructor/BecomeInstructor';
import CertificateVerify from './pages/Certificates/CertificateVerify';
import Instructors from './pages/Instructors/Instructors';
import CoursesList from './pages/Courses/CoursesList';

// Pages de cours
import CourseDetails from './pages/Courses/CourseDetails';
import CourseLearn from './pages/Courses/CourseLearn';
import CourseProgress from './pages/Courses/CourseProgress';
import CourseEnroll from './pages/Courses/CourseEnroll';
import CoursePreview from './pages/Courses/CoursePreview';
import LessonDetail from './pages/Courses/LessonDetail';

// 🆕 Espace étudiant avec sidebar
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCertificates from './pages/student/StudentCertificates';
import UserProfile from './pages/Profile/UserProfile';

// Pages étudiantes legacy
import Leaderboard from './pages/student/Leaderboard';
import Notifications from './pages/student/Notifications';
import Subscriptions from './pages/student/Subscriptions';
import MyCourses from './pages/student/MyCourses';
import QuizPage from './pages/student/QuizPage';

// Instructeur
import InstructorLayout from './pages/Instructors/InstructorLayout';
import InstructorDashboard from './pages/Instructors/InstructorDashboard';
import InstructorCourses from './pages/Instructors/InstructorCourses';
import CourseForm from './pages/Instructors/CourseForm';
import CourseModules from './pages/Instructors/CourseModules';
import CourseQuizzes from './pages/Instructors/CourseQuizzes';
import CourseStudents from './pages/Instructors/CourseStudents';
import InstructorSubmissions from './pages/Instructors/InstructorSubmissions';
import InstructorAnalytics from './pages/Instructors/InstructorAnalytics';

// Admin
import AdminLayout from "./components/Layout/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminUserProfile from "./pages/Admin/AdminUserProfile";
import AdminCourses from "./pages/Admin/AdminCourses";
import AdminEnrollments from "./pages/Admin/AdminEnrollments";
import AdminStats from "./pages/Admin/AdminStats";
import AdminMessages from "./pages/Admin/AdminMessages";
import AdminStudentDetail from "./pages/Admin/AdminStudentDetail";
import AdminInstructorApplications from "./pages/Admin/AdminInstructorApplications";
import AdminSubscriptions from "./pages/Admin/AdminSubscriptions";
import AdminCertificates from "./pages/Admin/AdminCertificates";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminLeaderboard from "./pages/Admin/AdminLeaderboard";
import AdminSettings from "./pages/Admin/AdminSettings";

// Soumissions
import StudentSubmission from "./pages/Submissions/StudentSubmission";
import AdminSubmissionReview from "./pages/Admin/AdminSubmissionReview";

// Guards
import ProtectedRoute from './components/Common/ProtectedRoute';
import CourseContentRoute from './components/Common/CourseContentRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <PermissionProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>

                {/* ── PAGES PUBLIQUES ── */}
                <Route path="/"                          element={<Home />} />
                <Route path="/contact"                   element={<Contact />} />
                <Route path="/contact/success"           element={<ContactSuccess />} />
                <Route path="/login"                     element={<Login />} />
                <Route path="/register"                  element={<Register />} />
                <Route path="/forgot-password"           element={<ForgotPassword />} />
                <Route path="/reset-password/:token"     element={<ResetPassword />} />
                <Route path="/verify-email/:token"       element={<VerifyEmail />} />
                <Route path="/about"                     element={<About />} />
                <Route path="/pricing"                   element={<Pricing />} />
                <Route path="/become-instructor"         element={<BecomeInstructor />} />
                <Route path="/certificates/verify"       element={<CertificateVerify />} />
                <Route path="/certificates/verify/:number" element={<CertificateVerify />} />
                <Route path="/instructors"               element={<Instructors />} />
                <Route path="/courses"                   element={<CoursesList />} />

                {/* ── COURS ── */}
                <Route path="/courses/:id"               element={<CourseDetails />} />
                <Route path="/courses/:id/preview"       element={<CoursePreview />} />
                <Route path="/courses/:id/learn"         element={<CourseContentRoute><CourseLearn /></CourseContentRoute>} />
                <Route path="/courses/:id/progress"      element={<ProtectedRoute allowedRoles={['student','instructor','admin']}><CourseProgress /></ProtectedRoute>} />
                <Route path="/courses/:id/lessons/:lessonId" element={<CourseContentRoute><LessonDetail /></CourseContentRoute>} />
                <Route path="/courses/:id/enroll"        element={<ProtectedRoute allowedRoles={['student','instructor','admin']}><CourseEnroll /></ProtectedRoute>} />
                <Route path="/courses/:courseId/submissions" element={<ProtectedRoute allowedRoles={['student']}><StudentSubmission /></ProtectedRoute>} />

                {/* ── ESPACE ÉTUDIANT — sidebar layout ── */}
                <Route path="/student"
                  element={<ProtectedRoute allowedRoles={['student','instructor','admin']}><StudentLayout /></ProtectedRoute>}
                >
                  <Route index          element={<StudentDashboard />} />
                  <Route path="active"      element={<StudentDashboard />} />
                  <Route path="completed"   element={<StudentDashboard />} />
                  <Route path="pending"     element={<StudentDashboard />} />
                  <Route path="profile"     element={<UserProfile />} />
                  <Route path="certificates" element={<StudentCertificates />} />
                  {/* <Route path="payments"     element={<StudentPayments />} /> */}
                </Route>

                {/* ── REDIRECTIONS LEGACY ── */}
                <Route path="/dashboard"
                  element={<ProtectedRoute allowedRoles={['student','instructor','admin']}><StudentLayout /></ProtectedRoute>}
                >
                  <Route index element={<StudentDashboard />} />
                </Route>

                <Route path="/profile"
                  element={<ProtectedRoute allowedRoles={['student','instructor','admin']}><UserProfile /></ProtectedRoute>}
                />

                {/* ── LEGACY sans sidebar ── */}
                <Route path="/my-courses"    element={<ProtectedRoute allowedRoles={['student','instructor','admin']}><MyCourses /></ProtectedRoute>} />
                <Route path="/courses/:courseId/quizzes/:quizId" element={<ProtectedRoute allowedRoles={['student','instructor','admin']}><QuizPage /></ProtectedRoute>} />
                <Route path="/leaderboard"   element={<Leaderboard />} />
                <Route path="/notifications" element={<ProtectedRoute allowedRoles={['student','instructor','admin']}><Notifications /></ProtectedRoute>} />
                <Route path="/subscriptions" element={<ProtectedRoute allowedRoles={['student','instructor','admin']}><Subscriptions /></ProtectedRoute>} />

                {/* ── INSTRUCTEUR ── */}
                <Route path="/instructor"
                  element={<ProtectedRoute allowedRoles={['instructor','admin']}><InstructorLayout /></ProtectedRoute>}
                >
                  <Route index                        element={<InstructorDashboard />} />
                  <Route path="courses"               element={<InstructorCourses />} />
                  <Route path="courses/new"           element={<CourseForm />} />
                  <Route path="courses/:id/edit"      element={<CourseForm />} />
                  <Route path="courses/:id/modules"   element={<CourseModules />} />
                  <Route path="courses/:id/quizzes"   element={<CourseQuizzes />} />
                  <Route path="courses/:id/students"  element={<CourseStudents />} />
                  <Route path="submissions"           element={<InstructorSubmissions />} />
                  <Route path="analytics"             element={<InstructorAnalytics />} />
                </Route>

                {/* ── ADMIN ── */}
                <Route path="/admin"
                  element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}
                >
                  <Route index                            element={<AdminDashboard />} />
                  <Route path="stats"                    element={<AdminStats />} />
                  <Route path="users"                    element={<AdminUsers />} />
                  <Route path="users/:id"                element={<AdminUserProfile />} />
                  <Route path="students/:userId"         element={<AdminStudentDetail />} />
                  <Route path="courses"                  element={<AdminCourses />} />
                  <Route path="categories"               element={<AdminCategories />} />
                  <Route path="enrollments"              element={<AdminEnrollments />} />
                  <Route path="submissions"              element={<AdminSubmissionReview />} />
                  <Route path="submissions/:id"          element={<AdminSubmissionReview />} />
                  <Route path="instructor-applications"  element={<AdminInstructorApplications />} />
                  <Route path="subscriptions"            element={<AdminSubscriptions />} />
                  <Route path="certificates"             element={<AdminCertificates />} />
                  <Route path="leaderboard"              element={<AdminLeaderboard />} />
                  <Route path="messages"                 element={<AdminMessages />} />
                  <Route path="settings"                 element={<AdminSettings />} />
                </Route>

              </Routes>
            </main>
            <Footer />
          </div>
        </PermissionProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;