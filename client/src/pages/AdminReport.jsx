import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import Step3Report from '../components/Step3Report';

function AdminReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(`${ServerUrl}/api/admin/report/${id}`, {
          withCredentials: true,
        });
        
        // Map the interview structure to the report structure expected by Step3Report
        const interview = result.data;
        const formattedReport = {
          ...interview,
          questionWiseScore: interview.questions.map(q => ({
            question: q.question,
            score: q.score || 0,
            feedback: q.feedback || "",
            detailedFeedback: q.detailedFeedback || "",
            idealAnswer: q.idealAnswer || "",
            strengths: q.strengths || [],
            improvements: q.improvements || [],
            skipped: q.skipped || false
          })),
          totalAnswered: interview.questions.filter(q => !q.skipped && q.answer && q.answer.trim() !== "").length,
          totalQuestions: interview.questions.length,
        };

        setReport(formattedReport);
      } catch (err) {
        setError('Failed to fetch the report or unauthorized access.');
      }
    };

    fetchReport();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate('/admin/dashboard')} className="bg-emerald-600 text-white px-6 py-2 rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm">
        <h2 className="text-gray-900 dark:text-white font-bold text-xl">Admin View: Candidate Report</h2>
        <button onClick={() => navigate('/admin/dashboard')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white border border-gray-300 dark:border-transparent px-4 py-2 rounded-lg text-sm transition">
          Return to Dashboard
        </button>
      </div>
      <Step3Report report={report} isAdminView={true} />
    </div>
  );
}

export default AdminReport;
