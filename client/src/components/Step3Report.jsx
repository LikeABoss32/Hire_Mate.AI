import React from 'react'
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaStar, FaTrophy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { BsArrowUpRight, BsArrowDownRight } from 'react-icons/bs';
import { useTheme } from '../context/ThemeContext';

function Step3Report({ report, isAdminView = false }) {
  const { darkMode } = useTheme();

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className='text-center'>
          <div className='w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Loading Report...</p>
        </div>
      </div>
    );
  }

  const navigate = useNavigate()
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
    readinessLevel = "Not Ready",
    overallStrengths = [],
    overallWeaknesses = [],
    recommendations = [],
    totalAnswered = 0,
    totalQuestions = 0,
    role = "",
    experience = "",
    mode = "",
    interviewType = "mock",
  } = report;

  if (interviewType === "test" && !isAdminView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className='bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl text-center max-w-lg mx-4 border border-gray-200 dark:border-gray-700'>
          <div className='w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6'>
            <FaCheckCircle size={40} />
          </div>
          <h2 className='text-3xl font-bold text-gray-800 dark:text-white mb-4'>Test Completed</h2>
          <p className='text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8'>
            Your interview is successfully completed. You may now leave the session.
          </p>
          <button onClick={() => navigate("/")} className='bg-black dark:bg-emerald-600 text-white px-8 py-3 rounded-full hover:opacity-90 transition shadow-md font-semibold'>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const radarData = [
    { subject: 'Confidence', A: confidence, fullMark: 10 },
    { subject: 'Communication', A: communication, fullMark: 10 },
    { subject: 'Correctness', A: correctness, fullMark: 10 },
  ];

  const skills = [
    { label: "Confidence", value: confidence, color: "emerald" },
    { label: "Communication", value: communication, color: "blue" },
    { label: "Correctness", value: correctness, color: "purple" },
  ];

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const readinessColors = {
    "Not Ready": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
    "Needs Work": { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-200 dark:border-yellow-800" },
    "Almost Ready": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
    "Interview Ready": { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  };

  const readinessStyle = readinessColors[readinessLevel] || readinessColors["Not Ready"];

  // Chart colors adapted for dark mode
  const chartTextColor = darkMode ? "#d1d5db" : "#6b7280";
  const chartGridColor = darkMode ? "#374151" : "#e5e7eb";
  const tooltipBg = darkMode ? "#1f2937" : "#ffffff";
  const tooltipBorder = darkMode ? "#374151" : "#e5e7eb";

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);
    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, { align: "center" });

    currentY += 5;
    doc.setDrawColor(34, 197, 94);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 15;

    // Score & Readiness
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 25, 4, 4, "F");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Final Score: ${finalScore}/10 | Readiness: ${readinessLevel}`, pageWidth / 2, currentY + 10, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Answered: ${totalAnswered}/${totalQuestions} questions`, pageWidth / 2, currentY + 18, { align: "center" });
    currentY += 35;

    // Skills
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");
    doc.setFontSize(12);
    doc.text(`Confidence: ${confidence}/10`, margin + 10, currentY + 10);
    doc.text(`Communication: ${communication}/10`, margin + 10, currentY + 18);
    doc.text(`Correctness: ${correctness}/10`, margin + 10, currentY + 26);
    currentY += 40;

    // Strengths
    if (overallStrengths.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Strengths", margin, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      overallStrengths.forEach(s => {
        doc.text(`• ${s}`, margin + 5, currentY);
        currentY += 6;
      });
      currentY += 5;
    }

    // Weaknesses
    if (overallWeaknesses.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Areas for Improvement", margin, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      overallWeaknesses.forEach(w => {
        doc.text(`• ${w}`, margin + 5, currentY);
        currentY += 6;
      });
      currentY += 5;
    }

    // Recommendations
    if (recommendations.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Recommendations", margin, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      recommendations.forEach(r => {
        const lines = doc.splitTextToSize(`• ${r}`, contentWidth - 10);
        doc.text(lines, margin + 5, currentY);
        currentY += lines.length * 5 + 2;
      });
      currentY += 5;
    }

    // Question Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.skipped ? `${q.question} (Skipped)` : q.question,
        `${q.score}/10`,
        q.feedback || "N/A",
      ]),
      styles: { fontSize: 8, cellPadding: 4, valign: "top" },
      headStyles: { fillColor: [34, 197, 94], textColor: 255, halign: "center" },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 55 },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: "auto" },
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save("AI_Interview_Report.pdf");
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-10 py-8 transition-colors duration-300'>
      {/* Header */}
      <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex items-start gap-4 flex-wrap'>
          <button
            onClick={() => navigate("/history")}
            className='mt-1 p-3 rounded-full bg-white dark:bg-gray-800 shadow dark:shadow-gray-900 hover:shadow-md transition'>
            <FaArrowLeft className='text-gray-600 dark:text-gray-300' />
          </button>
          <div>
            <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
              Interview Analytics Dashboard
            </h1>
            <p className='text-gray-500 dark:text-gray-400 mt-1'>
              {role && `${role} • `}{experience && `${experience} • `}{mode} Interview
            </p>
          </div>
        </div>

        <button onClick={downloadPDF}
          className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm text-nowrap'>
          Download PDF Report
        </button>
      </div>

      {/* Readiness Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 p-4 rounded-2xl border-2 ${readinessStyle.bg} ${readinessStyle.border} flex items-center justify-between`}>
        <div className='flex items-center gap-3'>
          <FaTrophy className={`${readinessStyle.text} text-2xl`} />
          <div>
            <p className={`font-bold text-lg ${readinessStyle.text}`}>{readinessLevel}</p>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              Answered {totalAnswered !== undefined && totalAnswered !== null ? totalAnswered : questionWiseScore.filter(q => !q.skipped).length} of {totalQuestions || questionWiseScore.length} questions
            </p>
          </div>
        </div>
        <div className={`text-3xl font-bold ${readinessStyle.text}`}>{finalScore}/10</div>
      </motion.div>


      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>

        {/* Left Column */}
        <div className='space-y-6'>
          {/* Score Circle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-8 text-center border border-transparent dark:border-gray-700">
            <h3 className="text-gray-500 dark:text-gray-400 mb-6">Overall Performance</h3>
            <div className='relative w-28 h-28 mx-auto'>
              <CircularProgressbar
                value={percentage}
                text={`${score}/10`}
                styles={buildStyles({
                  textSize: "18px",
                  pathColor: score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444",
                  textColor: darkMode ? "#f3f4f6" : "#111827",
                  trailColor: darkMode ? "#374151" : "#e5e7eb",
                  pathTransitionDuration: 1.5,
                })}
              />
            </div>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-6 border border-transparent dark:border-gray-700'>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Skill Radar</h3>
            <div className='h-56'>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={chartGridColor} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: chartTextColor }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10, fill: chartTextColor }} />
                  <Radar name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Skill Bars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-6 border border-transparent dark:border-gray-700'>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">Skill Evaluation</h3>
            <div className='space-y-5'>
              {skills.map((s, i) => (
                <div key={i}>
                  <div className='flex justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>{s.label}</span>
                    <span className='font-bold text-emerald-600 dark:text-emerald-400'>{s.value}/10</span>
                  </div>
                  <div className='bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden'>
                    <motion.div
                      className='bg-linear-to-r from-emerald-500 to-teal-400 h-full rounded-full'
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value * 10}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column (2 cols) */}
        <div className='lg:col-span-2 space-y-6'>

          {/* Strengths & Weaknesses */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-6 border border-transparent dark:border-gray-700'>
              <div className='flex items-center gap-2 mb-4'>
                <BsArrowUpRight className='text-emerald-500' />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Strengths</h3>
              </div>
              <div className='space-y-3'>
                {overallStrengths.length > 0 ? overallStrengths.map((s, i) => (
                  <div key={i} className='flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl'>
                    <FaCheckCircle className='text-emerald-500 mt-0.5 flex-shrink-0' />
                    <p className='text-sm text-gray-700 dark:text-gray-300'>{s}</p>
                  </div>
                )) : (
                  <p className='text-gray-400 dark:text-gray-500 text-sm'>Complete the interview to see strengths</p>
                )}
              </div>
            </motion.div>

            {/* Weaknesses */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-6 border border-transparent dark:border-gray-700'>
              <div className='flex items-center gap-2 mb-4'>
                <BsArrowDownRight className='text-amber-500' />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Areas to Improve</h3>
              </div>
              <div className='space-y-3'>
                {overallWeaknesses.length > 0 ? overallWeaknesses.map((w, i) => (
                  <div key={i} className='flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl'>
                    <FaExclamationTriangle className='text-amber-500 mt-0.5 flex-shrink-0' />
                    <p className='text-sm text-gray-700 dark:text-gray-300'>{w}</p>
                  </div>
                )) : (
                  <p className='text-gray-400 dark:text-gray-500 text-sm'>Complete the interview to see improvements</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-6 border border-transparent dark:border-gray-700'>
              <div className='flex items-center gap-2 mb-4'>
                <FaLightbulb className='text-blue-500' />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Recommendations</h3>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {recommendations.map((r, i) => (
                  <div key={i} className='flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl'>
                    <FaStar className='text-blue-400 mt-0.5 flex-shrink-0' size={12} />
                    <p className='text-sm text-gray-700 dark:text-gray-300'>{r}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Performance Trend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-6 border border-transparent dark:border-gray-700'>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">Performance Trend</h3>
            <div className='h-64 sm:h-72'>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="name" tick={{ fill: chartTextColor }} />
                  <YAxis domain={[0, 10]} tick={{ fill: chartTextColor }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: '8px',
                      color: darkMode ? '#f3f4f6' : '#111827'
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#22c55e" fill={darkMode ? "rgba(34,197,94,0.2)" : "#bbf7d0"} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Question Breakdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-6 border border-transparent dark:border-gray-700'>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">Detailed Question Breakdown</h3>
            <div className='space-y-6'>
              {questionWiseScore.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-5 rounded-2xl border ${q.skipped ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'}`}>

                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4'>
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Question {i + 1}</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base leading-relaxed">
                        {q.question || "Question not available"}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      {q.skipped && (
                        <span className='bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium'>Skipped</span>
                      )}
                      <div className={`px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit ${q.score >= 7 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        q.score >= 4 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {q.score ?? 0}/10
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl mb-3'>
                    <p className='text-xs text-green-600 dark:text-green-400 font-semibold mb-1'>AI Feedback</p>
                    <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
                      {q.feedback && q.feedback.trim() !== "" ? q.feedback : "No feedback available."}
                    </p>
                  </div>

                  {/* Detailed Feedback & Ideal Answer */}
                  {q.detailedFeedback && (
                    <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-3'>
                      <p className='text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1'>Detailed Analysis</p>
                      <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>{q.detailedFeedback}</p>
                    </div>
                  )}

                  {q.idealAnswer && (
                    <div className='bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-xl mb-3'>
                      <p className='text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1'>💡 Ideal Answer Should Include</p>
                      <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>{q.idealAnswer}</p>
                    </div>
                  )}

                  {/* Per-question strengths & improvements */}
                  {(q.strengths?.length > 0 || q.improvements?.length > 0) && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      {q.strengths?.length > 0 && (
                        <div className='bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl'>
                          <p className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2'>✓ What you did well</p>
                          {q.strengths.map((s, si) => (
                            <p key={si} className='text-xs text-gray-600 dark:text-gray-400 mb-1'>• {s}</p>
                          ))}
                        </div>
                      )}
                      {q.improvements?.length > 0 && (
                        <div className='bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl'>
                          <p className='text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2'>↗ How to improve</p>
                          {q.improvements.map((imp, ii) => (
                            <p key={ii} className='text-xs text-gray-600 dark:text-gray-400 mb-1'>• {imp}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Step3Report
