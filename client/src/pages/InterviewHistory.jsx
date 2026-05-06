import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { ServerUrl } from '../App'
import { FaArrowLeft, FaTrophy } from 'react-icons/fa'
import { motion } from "motion/react"

function InterviewHistory() {
    const [interviews, setInterviews] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                const result = await axios.get(ServerUrl + "/api/interview/get-interview", { withCredentials: true })
                setInterviews(result.data)
            } catch (error) {
                console.log(error)
            }
        }
        getMyInterviews()
    }, [])

    const readinessColors = {
        "Not Ready": "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        "Needs Work": "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
        "Almost Ready": "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        "Interview Ready": "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    };

    return (
        <div className='min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 py-10 transition-colors duration-300'>
            <div className='w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto'>

                <div className='mb-10 w-full flex items-start gap-4 flex-wrap'>
                    <button
                        onClick={() => navigate("/")}
                        className='mt-1 p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-md dark:shadow-gray-900 transition'>
                        <FaArrowLeft className='text-gray-600 dark:text-gray-300' />
                    </button>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
                            Interview History
                        </h1>
                        <p className='text-gray-500 dark:text-gray-400 mt-2'>
                            Track your past interviews and performance reports
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className='flex gap-3 mb-8 flex-wrap'>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate("/interview")}
                        className='bg-emerald-600 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-emerald-700 transition shadow-md'>
                        + New Interview
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate("/gd")}
                        className='bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-full font-medium text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition'>
                        Start Group Discussion
                    </motion.button>
                </div>

                {interviews.length === 0 ?
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='bg-white dark:bg-gray-800 p-10 rounded-2xl shadow dark:shadow-gray-900 text-center border border-transparent dark:border-gray-700'>
                        <div className='text-5xl mb-4'>📋</div>
                        <p className='text-gray-800 dark:text-white font-semibold text-lg mb-2'>No interviews yet</p>
                        <p className='text-gray-500 dark:text-gray-400 mb-6'>Start your first AI-powered interview to see your results here.</p>
                        <button
                            onClick={() => navigate("/interview")}
                            className='bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-700 transition'>
                            Start First Interview
                        </button>
                    </motion.div>
                    :
                    <div className='grid gap-4'>
                        {interviews.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => navigate(`/report/${item._id}`)}
                                className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:shadow-gray-900 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 card-hover'>
                                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            {item.role}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                            {item.experience} • {item.mode} Interview
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <div className='flex items-center gap-4'>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                {item.finalScore || 0}<span className='text-sm text-gray-400 dark:text-gray-500'>/10</span>
                                            </p>
                                        </div>

                                        {item.readinessLevel && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${readinessColors[item.readinessLevel] || 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                {item.readinessLevel}
                                            </span>
                                        )}

                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === "completed"
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}

export default InterviewHistory
