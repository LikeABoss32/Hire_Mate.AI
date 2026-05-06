import React from 'react'
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { HiMail, HiLockClosed, HiUser } from "react-icons/hi";
import { motion } from "motion/react"
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useState } from 'react';

function Auth({ isModel = false }) {
    const dispatch = useDispatch()
    const [isLogin, setIsLogin] = useState(true)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
            const payload = isLogin
                ? { email, password }
                : { name, email, password }

            const result = await axios.post(ServerUrl + endpoint, payload, { withCredentials: true })
            dispatch(setUserData(result.data))
            setLoading(false)
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
            setLoading(false)
            dispatch(setUserData(null))
        }
    }

    return (
        <div className={`
      w-full 
      ${isModel ? "py-4" : "min-h-screen bg-[#f3f3f3] dark:bg-gray-900 flex items-center justify-center px-6 py-20 transition-colors duration-300"}
    `}>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.05 }}
                className={`
        w-full 
        ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"}
        bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700
      `}>
                <div className='flex items-center justify-center gap-3 mb-6'>
                    <div className='bg-black dark:bg-emerald-600 text-white p-2 rounded-lg'>
                        <BsRobot size={18} />
                    </div>
                    <h2 className='font-semibold text-lg dark:text-white'>HireMate.AI</h2>
                </div>

                <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4 dark:text-white'>
                    {isLogin ? "Welcome Back to" : "Join"}
                    <span className='bg-green-100 dark:bg-green-900/40 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2 ml-2'>
                        <IoSparkles size={16} />
                        AI Smart Interview
                    </span>
                </h1>

                <p className='text-gray-500 dark:text-gray-400 text-center text-sm md:text-base leading-relaxed mb-8'>
                    {isLogin
                        ? "Sign in to continue your AI-powered interview practice and track your progress."
                        : "Create your free account to start AI-powered mock interviews with detailed analysis."}
                </p>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-6 text-center'>
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className='space-y-4'>
                    {!isLogin && (
                        <div className='relative'>
                            <HiUser className='absolute top-4 left-4 text-gray-400' size={18} />
                            <input
                                type='text'
                                placeholder='Full Name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={!isLogin}
                                className='w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
                            />
                        </div>
                    )}

                    <div className='relative'>
                        <HiMail className='absolute top-4 left-4 text-gray-400' size={18} />
                        <input
                            type='email'
                            placeholder='Email Address'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className='w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
                        />
                    </div>

                    <div className='relative'>
                        <HiLockClosed className='absolute top-4 left-4 text-gray-400' size={18} />
                        <input
                            type='password'
                            placeholder='Password (min 6 characters)'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className='w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
                        />
                    </div>

                    <motion.button
                        type='submit'
                        disabled={loading}
                        whileHover={{ opacity: 0.9, scale: 1.03 }}
                        whileTap={{ opacity: 1, scale: 0.98 }}
                        className='w-full flex items-center justify-center gap-3 py-3 bg-black dark:bg-emerald-600 text-white rounded-full shadow-md disabled:opacity-60 transition'>
                        {loading
                            ? (isLogin ? "Signing in..." : "Creating account...")
                            : (isLogin ? "Sign In" : "Create Free Account")}
                    </motion.button>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(""); }}
                            className='text-green-600 font-semibold ml-2 hover:underline'>
                            {isLogin ? "Sign Up Free" : "Sign In"}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default Auth
