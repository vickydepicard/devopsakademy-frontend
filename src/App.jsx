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
import CourseProgress from './pages/Courses/CourseProgress'; // ✅ AJOUT
import CourseEnroll from './pages/Courses/CourseEnroll';
import CoursePreview from './pages/Courses/CoursePreview';
import LessonDetail from './pages/Courses/LessonDetail';

// Dashboards
import Dashboard from './pages/Dashboard/Dashboard';
import ProfilePage from './pages/Profile/UserProfile';

// Espace étudiant
import MyCourses from './pages/Student/MyCourses';
import QuizPage from './pages/Student/QuizPage';
import Leaderboard from './pages/Student/Leaderboard';
import Notifications from './pages/Student/Notifications';
import Subscriptions from './pages/Student/Subscriptions';

// Espace instructeur
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

// Sécurité
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

                {/* ═══════════════════════════════════════
                    🌍 PAGES PUBLIQUES
                ═══════════════════════════════════════ */}
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

                {/* ═══════════════════════════════════════
                    📚 PAGES DES COURS
                ═══════════════════════════════════════ */}
                <Route path="/courses/:id"               element={<CourseDetails />} />
                <Route path="/courses/:id/preview"       element={<CoursePreview />} />

                {/* Contenu cours — accès restreint */}
                <Route
                  path="/courses/:id/learn"
                  element={
                    <CourseContentRoute>
                      <CourseLearn />
                    </CourseContentRoute>
                  }
                />

                {/* ✅ NOUVELLE ROUTE — Progression détaillée */}
                <Route
                  path="/courses/:id/progress"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                      <CourseProgress />
                    </ProtectedRoute>
                  }
                />

                {/* Leçon individuelle */}
                <Route
                  path="/courses/:id/lessons/:lessonId"
                  element={
                    <CourseContentRoute>
                      <LessonDetail />
                    </CourseContentRoute>
                  }
                />

                {/* Inscription */}
                <Route
                  path="/courses/:id/enroll"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                      <CourseEnroll />
                    </ProtectedRoute>
                  }
                />

                {/* ═══════════════════════════════════════
                    📤 SOUMISSIONS ÉTUDIANTS
                ═══════════════════════════════════════ */}
                <Route
                  path="/courses/:courseId/submissions"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentSubmission />
                    </ProtectedRoute>
                  }
                />

                {/* ═══════════════════════════════════════
                    🎓 DASHBOARD
                ═══════════════════════════════════════ */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* ═══════════════════════════════════════
                    🎓 ESPACE ÉTUDIANT
                ═══════════════════════════════════════ */}
                <Route
                  path="/my-courses"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                      <MyCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:courseId/quizzes/:quizId"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                      <QuizPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscriptions"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                      <Subscriptions />
                    </ProtectedRoute>
                  }
                />

                {/* ═══════════════════════════════════════
                    👤 PROFIL
                ═══════════════════════════════════════ */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* ═══════════════════════════════════════
                    🎓 ESPACE INSTRUCTEUR
                ═══════════════════════════════════════ */}
                <Route
                  path="/instructor"
                  element={
                    <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                      <InstructorLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index                              element={<InstructorDashboard />} />
                  <Route path="courses"                    element={<InstructorCourses />} />
                  <Route path="courses/new"                element={<CourseForm />} />
                  <Route path="courses/:id/edit"           element={<CourseForm />} />
                  <Route path="courses/:id/modules"        element={<CourseModules />} />
                  <Route path="courses/:id/quizzes"        element={<CourseQuizzes />} />
                  <Route path="courses/:id/students"       element={<CourseStudents />} />
                  <Route path="submissions"                element={<InstructorSubmissions />} />
                  <Route path="analytics"                  element={<InstructorAnalytics />} />
                </Route>

                {/* ═══════════════════════════════════════
                    🛠️ ESPACE ADMIN
                ═══════════════════════════════════════ */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Dashboard + Stats */}
                  <Route index                             element={<AdminDashboard />} />
                  <Route path="stats"                     element={<AdminStats />} />

                  {/* Utilisateurs */}
                  <Route path="users"                     element={<AdminUsers />} />
                  <Route path="users/:id"                 element={<AdminUserProfile />} />
                  <Route path="students/:userId"          element={<AdminStudentDetail />} />

                  {/* Cours & Contenu */}
                  <Route path="courses"                   element={<AdminCourses />} />
                  <Route path="categories"                element={<AdminCategories />} />

                  {/* Inscriptions & Soumissions */}
                  <Route path="enrollments"               element={<AdminEnrollments />} />
                  <Route path="submissions"               element={<AdminSubmissionReview />} />
                  <Route path="submissions/:id"           element={<AdminSubmissionReview />} />

                  {/* Candidatures instructeurs */}
                  <Route path="instructor-applications"   element={<AdminInstructorApplications />} />

                  {/* Financier */}
                  <Route path="subscriptions"             element={<AdminSubscriptions />} />

                  {/* Plateforme */}
                  <Route path="certificates"              element={<AdminCertificates />} />
                  <Route path="leaderboard"               element={<AdminLeaderboard />} />
                  <Route path="messages"                  element={<AdminMessages />} />
                  <Route path="settings"                  element={<AdminSettings />} />
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