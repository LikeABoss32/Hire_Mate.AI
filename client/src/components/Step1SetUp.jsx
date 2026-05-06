import React from 'react'
import { motion } from "motion/react"
import {
    FaUserTie,
    FaBriefcase,
    FaFileUpload,
    FaMicrophoneAlt,
    FaChartLine,
    FaUsers,
} from "react-icons/fa";
import { useState } from 'react';
import axios from "axios"
import { ServerUrl } from '../App';
import { useSelector } from 'react-redux';

function Step1SetUp({ interviewType, onStart }) {
    const { userData } = useSelector((state) => state.user)
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");


    const handleUploadResume = async () => {
        if (!resumeFile || analyzing) return;
        setAnalyzing(true)

        const formdata = new FormData()
        formdata.append("resume", resumeFile)

        try {
            const result = await axios.post(ServerUrl + "/api/interview/resume", formdata, { withCredentials: true })

            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            setAnalysisDone(true);
            setAnalyzing(false);

        } catch (error) {
            console.log(error)
            setAnalyzing(false);
        }
    }

    const handleStart = async () => {
        setLoading(true)
        setError("")
        try {
            const result = await axios.post(ServerUrl + "/api/interview/generate-questions", { role, experience, mode, interviewType, resumeText, projects, skills }, { withCredentials: true })
            setLoading(false)
            onStart(result.data)

        } catch (error) {
            console.log(error)
            setError(error.response?.data?.message || "Failed to generate questions. Please check your connection and try again.")
            setLoading(false)
        }
    }

    const modeOptions = [
        { value: "Technical", label: "Technical Interview", icon: "💻", desc: "Deep technical questioning" },
        { value: "HR", label: "HR Interview", icon: "🤝", desc: "Behavioral & communication" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className='min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 px-4 py-8'>

            <div className='w-full max-w-6xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden'>

                <motion.div
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className='relative bg-linear-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700 p-12 flex flex-col justify-center'>

                    <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
                        Start Your AI Interview
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-10">
                        Practice real interview scenarios powered by AI.
                        Get resume-specific questions, detailed analysis, and actionable feedback.
                    </p>

                    <div className='space-y-5'>
                        {
                            [
                                {
                                    icon: <FaUserTie className="text-green-600 text-xl" />,
                                    text: "Resume-Based Smart Questions",
                                },
                                {
                                    icon: <FaMicrophoneAlt className="text-green-600 text-xl" />,
                                    text: "Voice Interview with AI",
                                },
                                {
                                    icon: <FaChartLine className="text-green-600 text-xl" />,
                                    text: "Advanced Performance Analytics",
                                },
                                {
                                    icon: <FaUsers className="text-green-600 text-xl" />,
                                    text: "Group Discussion Mode",
                                },
                            ].map((item, index) => (
                                <motion.div key={index}
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + index * 0.15 }}
                                    whileHover={{ scale: 1.03 }}
                                    className='flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm cursor-pointer'>
                                    {item.icon}
                                    <span className='text-gray-700 dark:text-gray-200 font-medium'>{item.text}</span>
                                </motion.div>
                            ))
                        }
                    </div>

                  

                </motion.div>



                <motion.div
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="p-12 bg-white dark:bg-gray-800 overflow-y-auto max-h-[90vh]">

                    <h2 className='text-3xl font-bold text-gray-800 dark:text-white mb-8'>
                        Interview Setup
                    </h2>


                    <div className='space-y-6'>

                        <div className='relative'>
                            <FaUserTie className='absolute top-4 left-4 text-gray-400' />
                            <input type='text' placeholder='Enter role (e.g. Full Stack Developer)'
                                className='w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
                                onChange={(e) => setRole(e.target.value)} value={role} />
                        </div>


                        <div className='relative'>
                            <FaBriefcase className='absolute top-4 left-4 text-gray-400' />
                            <input type='text' placeholder='Experience (e.g. 2 years)'
                                className='w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
                                onChange={(e) => setExperience(e.target.value)} value={experience} />
                        </div>

                        {/* Mode Selection Cards */}
                        <div>
                            <label className='text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 block'>Interview Mode</label>
                            <div className='grid grid-cols-3 gap-3'>
                                {modeOptions.map((opt) => (
                                    <motion.button
                                        key={opt.value}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setMode(opt.value)}
                                        className={`p-3 rounded-xl border-2 text-center transition-all ${mode === opt.value
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md'
                                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300'
                                            }`}>
                                        <div className='text-2xl mb-1'>{opt.icon}</div>
                                        <div className='text-xs font-semibold text-gray-800 dark:text-gray-200'>{opt.label}</div>
                                        <div className='text-[10px] text-gray-400 mt-0.5'>{opt.desc}</div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {!analysisDone && (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                onClick={() => document.getElementById("resumeUpload").click()}
                                className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition'>

                                <FaFileUpload className='text-4xl mx-auto text-green-600 mb-3' />

                                <input type="file"
                                    accept="application/pdf"
                                    id="resumeUpload"
                                    className='hidden'
                                    onChange={(e) => {
                                        const file = e?.target?.files?.[0];
                                        if (file) {
                                            setResumeFile(file);
                                        }
                                    }} />

                                <p className='text-gray-600 dark:text-gray-300 font-medium'>
                                    {resumeFile ? resumeFile.name : "Upload Resume (PDF) — Highly Recommended"}
                                </p>
                                <p className='text-gray-400 text-xs mt-1'>Questions will be tailored to your resume</p>

                                {resumeFile && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUploadResume()
                                        }}
                                        className='mt-4 bg-gray-900 dark:bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-emerald-700 transition'>
                                        {analyzing ? (
                                            <span className='flex items-center gap-2'>
                                                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
                                                Analyzing...
                                            </span>
                                        ) : "Analyze Resume"}
                                    </motion.button>)}

                            </motion.div>
                        )}

                        {analysisDone && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-5 space-y-4'>
                                <div className='flex items-center gap-2'>
                                    <span className='text-green-500 text-lg'>✓</span>
                                    <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Resume Analyzed</h3>
                                </div>

                                {projects.length > 0 && (
                                    <div>
                                        <p className='font-medium text-gray-700 dark:text-gray-200 mb-1'>Projects:</p>
                                        <ul className='list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1'>
                                            {projects.map((p, i) => (
                                                <li key={i}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {skills.length > 0 && (
                                    <div>
                                        <p className='font-medium text-gray-700 dark:text-gray-200 mb-1'>Skills:</p>
                                        <div className='flex flex-wrap gap-2'>
                                            {skills.map((s, i) => (
                                                <span key={i} className='bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm'>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}


                        {error && (
                            <div className='bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl text-center'>
                                {error}
                            </div>
                        )}

                        <motion.button
                            onClick={handleStart}
                            disabled={!role || !experience || loading}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-full disabled:bg-gray-400 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-full text-lg font-semibold transition duration-300 shadow-md'>
                            {loading ? (
                                <span className='flex items-center justify-center gap-2'>
                                    <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
                                    Generating Questions...
                                </span>
                            ) : "Start Interview"}
                        </motion.button>
                    </div>

                </motion.div>
            </div>

        </motion.div>
    )
}

export default Step1SetUp
