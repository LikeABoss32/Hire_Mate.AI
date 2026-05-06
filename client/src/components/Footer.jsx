import React from 'react'
import { BsRobot } from 'react-icons/bs'
import { FaGithub, FaTwitter, FaLinkedin, FaHeart } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

function Footer() {
  const navigate = useNavigate()

  return (
    <div className='bg-[#f3f3f3] dark:bg-gray-900 flex justify-center px-4 pb-10 py-4 pt-10 transition-colors duration-300'>
      <div className='w-full max-w-6xl bg-white dark:bg-gray-800 rounded-[24px] shadow-sm border border-gray-200 dark:border-gray-700 py-10 px-8'>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
          {/* Brand */}
          <div className='md:col-span-1'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='bg-black dark:bg-emerald-600 text-white p-2 rounded-lg'><BsRobot size={16} /></div>
              <h2 className='font-semibold text-lg dark:text-white'>HireMate.AI</h2>
            </div>
            <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed'>
              AI-powered interview preparation platform designed to improve
              communication skills, technical depth and professional confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='font-semibold text-gray-800 dark:text-white mb-4 text-sm'>Practice</h3>
            <div className='space-y-2'>
              <button onClick={() => navigate("/interview")} className='block text-gray-500 dark:text-gray-400 text-sm hover:text-black dark:hover:text-white transition'>Technical Interview</button>
              <button onClick={() => navigate("/interview")} className='block text-gray-500 dark:text-gray-400 text-sm hover:text-black dark:hover:text-white transition'>HR Interview</button>
              <button onClick={() => navigate("/gd")} className='block text-gray-500 dark:text-gray-400 text-sm hover:text-black dark:hover:text-white transition'>Group Discussion</button>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className='font-semibold text-gray-800 dark:text-white mb-4 text-sm'>Resources</h3>
            <div className='space-y-2'>
              <button onClick={() => navigate("/history")} className='block text-gray-500 dark:text-gray-400 text-sm hover:text-black dark:hover:text-white transition'>Interview History</button>
              <button className='block text-gray-500 dark:text-gray-400 text-sm hover:text-black dark:hover:text-white transition'>Performance Analytics</button>
              <button className='block text-gray-500 dark:text-gray-400 text-sm hover:text-black dark:hover:text-white transition'>PDF Reports</button>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h3 className='font-semibold text-gray-800 dark:text-white mb-4 text-sm'>Connect</h3>
            <div className='flex gap-3'>
              <a href="#" className='w-9 h-9 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-emerald-600 transition'>
                <FaGithub size={16} />
              </a>
              <a href="#" className='w-9 h-9 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-emerald-600 transition'>
                <FaTwitter size={16} />
              </a>
              <a href="#" className='w-9 h-9 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-emerald-600 transition'>
                <FaLinkedin size={16} />
              </a>
            </div>
            <p className='text-gray-400 text-xs mt-4'>
              100% Free Platform
            </p>
          </div>
        </div>

        <div className='border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3'>
          <p className='text-gray-400 text-xs'>
            © 2026 InterviewIQ.AI. All rights reserved.
          </p>
          <p className='text-gray-400 text-xs flex items-center gap-1'>
            Made with <FaHeart className='text-red-400' size={10} /> for job seekers
          </p>
        </div>

      </div>
    </div>
  )
}

export default Footer
