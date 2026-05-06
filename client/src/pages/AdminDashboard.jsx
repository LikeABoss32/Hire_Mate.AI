import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ServerUrl } from '../App';
import { FaUserGraduate, FaChartLine, FaSearch, FaEye, FaTrash } from 'react-icons/fa';

function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this interview record?")) {
      try {
        await axios.delete(`${ServerUrl}/api/admin/interview/${id}`, { withCredentials: true });
        
        // Refresh data
        setLoading(true);
        const [statsRes, candidatesRes] = await Promise.all([
          axios.get(`${ServerUrl}/api/admin/stats`, { withCredentials: true }),
          axios.get(`${ServerUrl}/api/admin/candidates?type=test`, { withCredentials: true })
        ]);
        
        setStats(statsRes.data);
        setCandidates(candidatesRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to delete interview:", err);
        alert("Failed to delete interview. Ensure you have admin privileges.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, candidatesRes] = await Promise.all([
          axios.get(`${ServerUrl}/api/admin/stats`, { withCredentials: true }),
          axios.get(`${ServerUrl}/api/admin/candidates?type=test`, { withCredentials: true })
        ]);
        
        setStats(statsRes.data);
        setCandidates(candidatesRes.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Unauthorized access or failed to fetch data. Please login as admin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center transition-colors">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-red-200 dark:border-red-900 shadow-xl max-w-md w-full">
          <p className="text-red-500 dark:text-red-400 font-medium mb-6">{error}</p>
          <button 
            onClick={() => navigate('/admin')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-10 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Monitor candidate performance and review secure test sessions.</p>
          </div>
          
          <button 
            onClick={() => navigate('/')} 
            className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-xl transition shadow-sm font-medium text-sm"
          >
            Exit Dashboard
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
              <FaUserGraduate size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Candidates</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.totalCandidates || 0}</h3>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
              <FaChartLine size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Interviews</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.totalInterviews || 0}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold">★</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Avg Score</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.averageScore || "0.0"}/10</h3>
            </div>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-2 h-6 bg-red-500 rounded-full inline-block"></span>
              Secure Test Sessions
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Candidate</th>
                  <th className="px-6 py-4 font-medium">Role applied</th>
                  <th className="px-6 py-4 font-medium">Mode</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium">Readiness</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading candidates...</td>
                  </tr>
                ) : candidates.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaSearch size={30} className="text-gray-400 dark:text-gray-600 mb-3" />
                        <p>No interviews found for the selected mode.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  candidates.map((interview) => (
                    <tr key={interview._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-200">{interview.userId?.name || 'Unknown User'}</div>
                        <div className="text-xs text-gray-500">{interview.userId?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{interview.role}</div>
                        <div className="text-xs text-gray-500">{interview.experience}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-600">
                          {interview.mode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{interview.finalScore?.toFixed(1) || 0}/10</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          interview.readinessLevel === 'Interview Ready' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' :
                          interview.readinessLevel === 'Almost Ready' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' :
                          interview.readinessLevel === 'Needs Work' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' :
                          'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                        }`}>
                          {interview.readinessLevel || 'Not Evaluated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/report/${interview._id}`)}
                          className="bg-gray-100 hover:bg-emerald-600 text-gray-700 hover:text-white dark:bg-gray-700 dark:hover:bg-emerald-600 dark:text-white border border-gray-200 dark:border-transparent p-2.5 rounded-lg transition"
                          title="View Full Report"
                        >
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => handleDelete(interview._id)}
                          className="bg-gray-100 hover:bg-red-600 text-gray-700 hover:text-white dark:bg-gray-700 dark:hover:bg-red-600 dark:text-white border border-gray-200 dark:border-transparent p-2.5 rounded-lg transition"
                          title="Delete Record"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
