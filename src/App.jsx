import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Pages publiques
import Home from './pages/Home/Home';
import Contact from './pages/Contact/Contact';
import ContactSuccess from './pages/Contact/ContactSuccess';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Instructors from './pages/Instructors/Instructors';
import CoursesList from './pages/Courses/CoursesList';
import Course from './pages/Courses/Course';
import LessonDetail from './pages/Courses/LessonDetail';
import CourseEnroll from './pages/Courses/CourseEnroll'
import CoursePreview from './pages/Courses/CoursePreview'

// Dashboards
import Dashboard from './pages/Dashboard/Dashboard';
import InstructorDashboard from './pages/Dashboard/InstructorDashboard';
import ProfilePage from './pages/Profile/UserProfile';

// Admin
import AdminLayout from "./components/Layout/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminUserProfile from "./pages/Admin/AdminUserProfile";
import AdminCourses from "./pages/Admin/AdminCourses";
import AdminEnrollments from "./pages/Admin/AdminEnrollments";
import AdminStats from "./pages/Admin/AdminStats";
import AdminMessages from "./pages/Admin/AdminMessages";
import CourseDetail from "./pages/Courses/CourseDetails";
import PurchasePage from "./pages/student/CourseDetail";



// Sécurité
import ProtectedRoute from './components/Common/ProtectedRoute';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* === 🌍 Pages publiques === */}
              <Route path="/" element={<Home />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/contact/success" element={<ContactSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/instructors" element={<Instructors />} />
              <Route path="/courses" element={<CoursesList />} />
              <Route path="/courses/:id" element={<Course />} />
              <Route path="/courses/:id/lessons/:lessonId" element={<LessonDetail />} />
              <Route path="/courses/:id/enroll" element={<CourseEnroll />} />
              <Route path="/courses/:id" element={<CoursePreview />} />
              <Route path="/purchase/:id" element={<PurchasePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses/:id" element={<CourseDetail />} />




              {/* === 🎓 Dashboards protégés === */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/instructor"
                element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* === 🛠️ Admin Layout + sous-routes === */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/:id" element={<AdminUserProfile />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="enrollments" element={<AdminEnrollments />} />
                <Route path="stats" element={<AdminStats />} />
                <Route path="messages" element={<AdminMessages />} /> {/* ✅ correcte */}
              </Route>

              {/* === 👤 Profil utilisateur === */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student','instructor','admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
