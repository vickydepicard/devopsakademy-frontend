import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { 
  Users,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  AlertCircle,
  Loader2,
  ChevronRight,
  FileText,
  BarChart,
  GraduationCap,
  Filter,
  Download,
  Eye
} from "lucide-react";

export default function AdminEnrollments() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Fetch students with enrollments
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      const response = await api.get("/enrollments");
      if (!response.data.success) throw new Error("Failed to load data");
      
      const enrollments = response.data.data || [];
      const studentsMap = new Map();
      
      // Process enrollments
      enrollments.forEach(enrollment => {
        const studentId = enrollment.user_id;
        
        if (!studentsMap.has(studentId)) {
          studentsMap.set(studentId, {
            id: studentId,
            name: `${enrollment.first_name} ${enrollment.last_name}`,
            email: enrollment.email,
            avatar: enrollment.avatar_url,
            enrollments: [],
            pending: 0,
            approved: 0,
            rejected: 0
          });
        }
        
        const student = studentsMap.get(studentId);
        student.enrollments.push(enrollment);
        
        // Update counts
        if (enrollment.is_approved) student.approved++;
        else if (enrollment.status === "rejected") student.rejected++;
        else student.pending++;
      });
      
      // Calculate statistics
      const studentsList = Array.from(studentsMap.values());
      const statsData = {
        total: studentsList.length,
        pending: studentsList.filter(s => s.pending > 0).length,
        approved: studentsList.filter(s => s.pending === 0 && s.rejected === 0).length,
        rejected: studentsList.filter(s => s.rejected > 0).length
      };
      
      setStudents(studentsList);
      setStats(statsData);
      
    } catch (err) {
      console.error("Error loading data:", err);
      alert("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students
  const filteredStudents = students.filter(student => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      );
    }
    
    switch (filter) {
      case "pending": return student.pending > 0;
      case "approved": return student.pending === 0 && student.rejected === 0;
      case "rejected": return student.rejected > 0;
      default: return true;
    }
  });

  // Get student status
  const getStudentStatus = (student) => {
    if (student.pending > 0) {
      return { text: "Pending", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" /> };
    }
    if (student.rejected > 0) {
      return { text: "Rejected", color: "bg-red-100 text-red-800", icon: <XCircle className="w-4 h-4" /> };
    }
    return { text: "Approved", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> };
  };

  // Get progress percentage
  const getProgress = (student) => {
    const total = student.enrollments.length;
    const approved = student.approved;
    return total > 0 ? Math.round((approved / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Student Management
              </h1>
              <p className="text-gray-600">
                View and manage student enrollments
              </p>
            </div>
            
            <button
              onClick={fetchStudents}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Pending</p>
                  <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">All Approved</p>
                  <p className="text-xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Rejected</p>
                  <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All", icon: Users, count: stats.total },
                { id: "pending", label: "Pending", icon: Clock, count: stats.pending },
                { id: "approved", label: "Approved", icon: CheckCircle, count: stats.approved },
                { id: "rejected", label: "Rejected", icon: XCircle, count: stats.rejected },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${
                    filter === item.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    filter === item.id ? "bg-white/20" : "bg-gray-200"
                  }`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No students found
              </h3>
              <p className="text-gray-600 mb-6">
                {search 
                  ? `No results for "${search}"` 
                  : "No students match the selected filter."}
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Show all students
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredStudents.map((student) => {
                const status = getStudentStatus(student);
                const progress = getProgress(student);
                
                return (
                  <div
                    key={student.id}
                    className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/admin/students/${student.id}`)}
                  >
                    <div className="p-4">
                      {/* Student Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}&background=3B3A82&color=fff&size=64`}
                            alt={student.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {student.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[180px]">{student.email}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>

                      {/* Status */}
                      <div className="mb-3">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${status.color}`}>
                          {status.icon}
                          <span className="text-sm font-medium">{status.text}</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Counts */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-bold text-gray-900">{student.enrollments.length}</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <div className="font-bold text-yellow-700">{student.pending}</div>
                          <div className="text-xs text-yellow-600">Pending</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-bold text-green-700">{student.approved}</div>
                          <div className="text-xs text-green-600">Approved</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/students/${student.id}`);
                          }}
                          className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Recent Courses */}
                    {student.enrollments.length > 0 && (
                      <div className="border-t border-gray-100 bg-gray-50/50 p-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">
                          Recent Courses
                        </h4>
                        <div className="space-y-1">
                          {student.enrollments.slice(0, 2).map((enrollment, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 truncate max-w-[140px]">
                                {enrollment.course_title}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                enrollment.is_approved ? 'bg-green-100 text-green-800' :
                                enrollment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {enrollment.is_approved ? 'Approved' : 
                                 enrollment.status === 'rejected' ? 'Rejected' : 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overview */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="w-5 h-5 text-gray-700" />
            <h3 className="font-bold text-gray-900">Overview</h3>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>• {stats.pending} student(s) have pending course approvals</p>
            <p>• {stats.approved} student(s) have all courses approved</p>
            <p>• Click on any student to manage their enrollments</p>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Quick Tips</h4>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>1. Use filters to find students by status</p>
            <p>2. Click student cards to view detailed enrollment information</p>
            <p>3. Approve or reject enrollments from student detail pages</p>
          </div>
        </div>

      </div>
    </div>
  );
}