import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from "motion/react"
import { BsRobot, BsSun, BsMoon } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut, FaHistory } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
    const { userData } = useSelector((state) => state.user)
    const [showUserPopup, setShowUserPopup] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showAuth, setShowAuth] = useState(false);
    const { darkMode, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
            dispatch(setUserData(null))
            setShowUserPopup(false)
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

    const scrollToSection = (id) => {
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <div className='bg-[#f3f3f3] dark:bg-gray-900 flex justify-center px-4 pt-6 sticky top-0 z-50 transition-colors duration-300'>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-full max-w-6xl rounded-[24px] shadow-sm border border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center relative transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-white dark:bg-gray-800'}`}>

                <div onClick={() => navigate("/")} className='flex items-center gap-3 cursor-pointer'>
                    <div className='bg-black dark:bg-emerald-600 text-white p-2 rounded-lg'>
                        <BsRobot size={18} />
                    </div>
                    <h1 className='font-semibold hidden md:block text-lg dark:text-white'>HireMate.AI</h1>
                </div>

                {/* Nav Links - visible on desktop */}
                <div className='hidden md:flex items-center gap-8'>
                    <button onClick={() => scrollToSection('features')} className='text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition font-medium'>Features</button>
                    <button onClick={() => scrollToSection('modes')} className='text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition font-medium'>Modes</button>
                    <button onClick={() => scrollToSection('faq')} className='text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition font-medium'>FAQ</button>
                    <button onClick={() => navigate(userData?.role === 'admin' ? '/admin/dashboard' : '/admin')} className='text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition font-medium flex items-center gap-1'>
                        Admin Portal
                    </button>
                </div>

                <div className='flex items-center gap-3 relative'>
                    {/* Theme Toggle */}
                    <motion.button
                        onClick={toggleTheme}
                        whileTap={{ scale: 0.9, rotate: 180 }}
                        className='w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition'>
                        {darkMode ? <BsSun size={16} /> : <BsMoon size={16} />}
                    </motion.button>

                    {userData && (
                        <button
                            onClick={() => navigate("/history")}
                            className='flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium dark:text-gray-200'>
                            <FaHistory size={14} />
                            <span className='hidden sm:inline'>History</span>
                        </button>
                    )}

                    <div className='relative'>
                        <button
                            onClick={() => {
                                if (!userData) {
                                    setShowAuth(true)
                                    return;
                                }
                                setShowUserPopup(!showUserPopup);
                            }} className='w-9 h-9 bg-black dark:bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold hover:scale-105 transition'>
                            {userData ? userData?.name?.slice(0, 1).toUpperCase() : <FaUserAstronaut size={16} />}
                        </button>

                        {showUserPopup && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className='absolute right-0 mt-3 w-52 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-4 z-50'>
                                <div className='mb-3 pb-3 border-b border-gray-100 dark:border-gray-700'>
                                    <p className='text-sm font-semibold text-gray-800 dark:text-white'>{userData?.name}</p>
                                    <p className='text-xs text-gray-400 mt-0.5'>{userData?.email}</p>
                                </div>

                                <button onClick={() => { navigate("/history"); setShowUserPopup(false); }}
                                    className='w-full text-left text-sm py-2 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center gap-2'>
                                    <FaHistory size={12} /> Interview History
                                </button>
                                <button onClick={() => { navigate("/gd"); setShowUserPopup(false); }}
                                    className='w-full text-left text-sm py-2 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center gap-2'>
                                    <BsRobot size={12} /> Group Discussion
                                </button>
                                <button onClick={handleLogout}
                                    className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 hover:text-red-600 mt-1 pt-2 border-t border-gray-100 dark:border-gray-700'>
                                    <HiOutlineLogout size={16} />
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

            </motion.div>

            {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
        </div>
    )
}

export default Navbar
