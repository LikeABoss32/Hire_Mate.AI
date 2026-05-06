import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { useSelector } from 'react-redux'
import { motion } from "motion/react";
import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText,
  BsChevronDown,
  BsChevronUp,
  BsLightning,
  BsPeople,
  BsShield,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { FaUsers, FaChartLine, FaBrain, FaCheckCircle, FaMicrophone } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import AuthModel from '../components/AuthModel';
import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from '../components/Footer';


function Home() {
  const { userData } = useSelector((state) => state.user)
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [countersVisible, setCountersVisible] = useState(false)
  const statsRef = useRef(null)

  // Animated counter
  const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0)
    useEffect(() => {
      if (!countersVisible) return;
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [countersVisible, end, duration]);
    return count;
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCountersVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const interviewCount = useCounter(10000);
  const satisfactionCount = useCounter(95);
  const questionsCount = useCounter(50000);
  const freeCount = useCounter(100);

  const faqs = [
    { q: "Is HireMate.AI completely free?", a: "Yes! All interview features, analysis, and reports are 100% free with unlimited usage. No credit card required." },
    { q: "How does the AI generate questions?", a: "Our AI analyzes your resume, role, experience, and skills to generate highly relevant questions that mirror real interview scenarios." },
    { q: "What is Group Discussion mode?", a: "GD mode lets you practice group discussions with 4 AI panelists who have distinct personalities. They respond to your points in real-time." },
    { q: "Can I skip questions during an interview?", a: "Yes! You can skip any question or finish the interview early anytime. Only answered questions are evaluated." },
    { q: "How detailed is the analysis?", a: "You get per-question scores, strengths, improvements, ideal answers, a radar chart, overall analysis, and actionable recommendations." },
    { q: "Do I need a resume to start?", a: "No, but uploading a resume is highly recommended as it enables the AI to generate much more relevant and personalized questions." },
  ];

  const handleNavigate = (path) => {
    if (!userData) {
      setShowAuth(true);
      return;
    }
    navigate(path);
  };

  return (
    <div className='min-h-screen bg-[#f3f3f3] dark:bg-gray-900 flex flex-col transition-colors duration-300'>
      <Navbar />

      <div className='flex-1 px-6 py-16'>
        <div className='max-w-6xl mx-auto'>

          {/* ===== HERO SECTION ===== */}
          <div className='text-center mb-20 relative'>
            {/* Floating decorative elements */}
            <div className='absolute top-0 left-10 w-20 h-20 bg-green-200 rounded-full opacity-30 animate-float blur-xl'></div>
            <div className='absolute top-20 right-16 w-16 h-16 bg-emerald-300 rounded-full opacity-20 animate-float-slow blur-xl'></div>
            <div className='absolute bottom-0 left-1/3 w-24 h-24 bg-teal-200 rounded-full opacity-20 animate-blob blur-xl'></div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className='flex justify-center mb-6'>
              <div className='bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm border border-gray-200 dark:border-gray-700'>
                <HiSparkles size={16} className="text-green-500" />
                AI Powered Smart Interview Platform — 100% Free
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-5xl mx-auto tracking-tight dark:text-white'>
              Master Your Next
              <br />
              <span className='relative inline-block mt-2'>
                <span className='bg-linear-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-600 px-6 py-2 rounded-full'>
                  Job Interview
                </span>
              </span>
              <br />
              <span className='text-gray-400 dark:text-gray-500 text-3xl md:text-5xl font-semibold mt-2 inline-block'>with AI Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className='text-gray-500 dark:text-gray-400 mt-8 max-w-2xl mx-auto text-lg leading-relaxed'>
              Practice Technical, HR & Group Discussion interviews with resume-specific questions,
              real-time voice interaction, and detailed performance analysis with actionable insights.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='flex flex-wrap justify-center gap-4 mt-10'>
              <motion.button
                onClick={() => handleNavigate("/interview")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className='bg-black dark:bg-emerald-600 text-white px-10 py-3.5 rounded-full hover:opacity-90 transition shadow-lg text-lg font-semibold animate-pulse-glow'>
                Start Free Interview
              </motion.button>

              <motion.button
                onClick={() => handleNavigate("/gd")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className='border-2 border-gray-300 dark:border-gray-600 dark:text-gray-200 px-10 py-3.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-lg font-medium'>
                Try Group Discussion
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className='flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-400 dark:text-gray-500'>
              <span className='flex items-center gap-1'><FaCheckCircle className='text-green-500' /> AI Powered Smart Interview Platform</span>
              <span className='flex items-center gap-1'><FaCheckCircle className='text-green-500' /> Resume-Based Questions</span>
              <span className='flex items-center gap-1'><FaCheckCircle className='text-green-500' /> Unlimited Free Interviews</span>
            </motion.div>
          </div>


          {/* ===== STATS SECTION ===== */}
          <div ref={statsRef} className='mb-28'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
              {[
                { value: interviewCount, suffix: "+", label: "Interviews Conducted", icon: <BsRobot /> },
                { value: satisfactionCount, suffix: "%", label: "User Satisfaction", icon: <FaChartLine /> },
                { value: questionsCount, suffix: "+", label: "Questions Generated", icon: <BsLightning /> },
                { value: freeCount, suffix: "%", label: "Free Forever", icon: <BsShield /> },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className='bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-sm border border-gray-200 dark:border-gray-700 card-hover'>
                  <div className='text-emerald-500 text-xl mx-auto mb-3 flex justify-center'>{stat.icon}</div>
                  <div className='text-3xl md:text-4xl font-bold text-gray-800 dark:text-white'>{stat.value}{stat.suffix}</div>
                  <div className='text-gray-500 dark:text-gray-400 text-sm mt-1'>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>


          {/* ===== HOW IT WORKS ===== */}
          <div className='mb-28'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className='text-4xl font-bold text-center mb-4 dark:text-white'>
              How It <span className="gradient-text">Works</span>
            </motion.h2>
            <p className='text-gray-500 dark:text-gray-400 text-center mb-16 max-w-xl mx-auto'>Three simple steps to ace your next interview</p>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {
                [
                  { icon: <BsRobot size={24} />, step: "STEP 1", title: "Setup & Upload Resume", desc: "Choose your role, experience, and mode. Upload your resume for personalized questions." },
                  { icon: <BsMic size={24} />, step: "STEP 2", title: "AI Voice Interview", desc: "Answer questions via voice or text. Skip anytime, finish when ready." },
                  { icon: <BsBarChart size={24} />, step: "STEP 3", title: "Detailed Analysis", desc: "Get scores, strengths, improvements, recommendations, and downloadable PDF report." },
                ].map((item, index) => (
                  <motion.div key={index}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 + index * 0.15 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className='bg-white dark:bg-gray-800 rounded-3xl border-2 border-green-100 dark:border-gray-700 hover:border-green-500 p-8 shadow-md hover:shadow-2xl transition-all duration-300 text-center'>
                    <div className='bg-green-50 dark:bg-green-900/30 border-2 border-green-500 text-green-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-5'>
                      {item.icon}</div>
                    <div className='text-xs text-green-600 font-semibold mb-2 tracking-wider'>{item.step}</div>
                    <h3 className='font-semibold mb-3 text-lg dark:text-white'>{item.title}</h3>
                    <p className='text-sm text-gray-500 dark:text-gray-400 leading-relaxed'>{item.desc}</p>
                  </motion.div>
                ))
              }
            </div>
          </div>


          {/* ===== FEATURES SECTION ===== */}
          <div id="features" className='mb-28'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className='text-4xl font-bold text-center mb-4 dark:text-white'>
              Advanced AI{" "}
              <span className="gradient-text">Capabilities</span>
            </motion.h2>
            <p className='text-gray-500 dark:text-gray-400 text-center mb-16 max-w-xl mx-auto'>Powered by cutting-edge AI for the most realistic interview experience</p>

            <div className='grid md:grid-cols-2 gap-8'>
              {
                [
                  { image: evalImg, icon: <BsBarChart size={20} />, title: "AI Answer Evaluation", desc: "Multi-dimensional scoring with confidence, communication, and correctness analysis. Get detailed feedback with strengths and improvements." },
                  { image: resumeImg, icon: <BsFileEarmarkText size={20} />, title: "Resume-Based Questions", desc: "AI reads your resume and generates questions about your specific projects, skills, and experience. No generic questions." },
                  { image: pdfImg, icon: <BsFileEarmarkText size={20} />, title: "Downloadable PDF Report", desc: "Comprehensive report with radar charts, skill breakdowns, per-question analysis, ideal answers, and actionable recommendations." },
                  { image: analyticsImg, icon: <BsBarChart size={20} />, title: "History & Analytics", desc: "Track all interviews, view readiness levels, compare scores across sessions, and monitor your improvement over time." },
                ].map((item, index) => (
                  <motion.div key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all card-hover'>
                    <div className='flex flex-col md:flex-row items-center gap-8'>
                      <div className='w-full md:w-1/2 flex justify-center'>
                        <img src={item.image} alt={item.title} className='w-full h-auto object-contain max-h-64' />
                      </div>
                      <div className='w-full md:w-1/2'>
                        <div className='bg-green-50 dark:bg-green-900/30 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6'>
                          {item.icon}
                        </div>
                        <h3 className='font-semibold mb-3 text-xl dark:text-white'>{item.title}</h3>
                        <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed'>{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              }
            </div>
          </div>


          {/* ===== INTERVIEW MODES ===== */}
          <div id="modes" className='mb-28'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className='text-4xl font-bold text-center mb-4 dark:text-white'>
              Multiple Interview{" "}
              <span className="gradient-text">Modes</span>
            </motion.h2>
            <p className='text-gray-500 dark:text-gray-400 text-center mb-16 max-w-xl mx-auto'>Practice different types of interviews to be fully prepared</p>

            <div className='grid md:grid-cols-2 gap-8'>
              {
                [
                  { img: hrImg, title: "HR Interview Mode", desc: "Behavioral and communication based evaluation. Practice STAR method answers and soft skills.", emoji: "🤝" },
                  { img: techImg, title: "Technical Mode", desc: "Deep technical questioning based on your role, skills, and projects from your resume.", emoji: "💻" },
                  { img: confidenceImg, title: "Voice & Confidence", desc: "Practice speaking answers aloud with AI voice interaction and real-time feedback.", emoji: "🎙️" },
                  { img: null, title: "Group Discussion", desc: "Discuss topics with 4 AI panelists who have distinct personalities. Practice leadership and teamwork.", emoji: "👥", isNew: true },
                ].map((mode, index) => (
                  <motion.div key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -6 }}
                    onClick={() => handleNavigate(mode.title === "Group Discussion" ? "/gd" : "/interview")}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer card-hover relative">

                    {mode.isNew && (
                      <div className='absolute top-4 right-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1 rounded-full font-semibold'>
                        NEW
                      </div>
                    )}

                    <div className='flex items-center justify-between gap-6'>
                      <div className="w-1/2">
                        <div className='text-4xl mb-3'>{mode.emoji}</div>
                        <h3 className="font-semibold text-xl mb-3 dark:text-white">{mode.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{mode.desc}</p>
                      </div>

                      {mode.img ? (
                        <div className="w-1/2 flex justify-end">
                          <img src={mode.img} alt={mode.title} className="w-28 h-28 object-contain" />
                        </div>
                      ) : (
                        <div className="w-1/2 flex justify-end">
                          <div className='w-28 h-28 bg-linear-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center'>
                            <FaUsers className='text-emerald-600 text-4xl' />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              }
            </div>
          </div>


          {/* ===== CTA SECTION ===== */}
          <div className='mb-28'>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className='bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden'>

              {/* Decorative */}
              <div className='absolute top-0 right-0 w-40 h-40 bg-emerald-500 rounded-full opacity-10 blur-3xl'></div>
              <div className='absolute bottom-0 left-0 w-56 h-56 bg-teal-500 rounded-full opacity-10 blur-3xl'></div>

              <h2 className='text-3xl md:text-5xl font-bold mb-4 relative z-10'>
                Ready to Ace Your Interview?
              </h2>
              <p className='text-gray-400 max-w-xl mx-auto mb-8 relative z-10'>
                Join thousands of candidates who improved their interview skills with AI-powered practice sessions.
              </p>
              <motion.button
                onClick={() => handleNavigate("/interview")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='bg-white text-black px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-2xl transition relative z-10'>
                Start Practicing Now — It's Free
              </motion.button>
            </motion.div>
          </div>


          {/* ===== FAQ SECTION ===== */}
          <div id="faq" className='mb-16'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className='text-4xl font-bold text-center mb-4 dark:text-white'>
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </motion.h2>
            <p className='text-gray-500 dark:text-gray-400 text-center mb-12 max-w-xl mx-auto'>Everything you need to know about HireMate.AI</p>

            <div className='max-w-3xl mx-auto space-y-4'>
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden'>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className='w-full flex justify-between items-center p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition'>
                    <span className='font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base pr-4'>{faq.q}</span>
                    {openFaq === i ? <BsChevronUp className='text-green-600 flex-shrink-0' /> : <BsChevronDown className='text-gray-400 flex-shrink-0' />}
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className='px-5 pb-5'>
                      <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed'>{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
      <Footer />
    </div>
  )
}

export default Home
