import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from "motion/react"
import { BsRobot, BsSend, BsArrowLeft, BsMic, BsMicMute } from 'react-icons/bs'
<<<<<<< HEAD
import { FaUsers, FaStop, FaMicrophone } from 'react-icons/fa'
=======
import { FaUsers, FaStop, FaMicrophone} from 'react-icons/fa'
>>>>>>> b9b0bc8effeae2b922580bc74c46464e9cb1a902
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { ServerUrl } from '../App'
import AuthModel from '../components/AuthModel'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useTheme } from '../context/ThemeContext'

const PANELIST_CONFIG = [
  { color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-500", ring: "ring-emerald-400", textColor: "text-emerald-600", bgLight: "bg-emerald-50" },
  { color: "from-blue-400 to-blue-600", bg: "bg-blue-500", ring: "ring-blue-400", textColor: "text-blue-600", bgLight: "bg-blue-50" },
  { color: "from-purple-400 to-purple-600", bg: "bg-purple-500", ring: "ring-purple-400", textColor: "text-purple-600", bgLight: "bg-purple-50" },
  { color: "from-amber-400 to-amber-600", bg: "bg-amber-500", ring: "ring-amber-400", textColor: "text-amber-600", bgLight: "bg-amber-50" },
];

function GDPage() {
  const { userData } = useSelector((state) => state.user)
  const { darkMode } = useTheme()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)

  // Setup state
  const [topic, setTopic] = useState("")
  const [customTopic, setCustomTopic] = useState("")
  const [phase, setPhase] = useState("setup")

  // Discussion state
  const [gdId, setGdId] = useState(null)
  const [panelists, setPanelists] = useState([])
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState("")
  const [sending, setSending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const [activeSpeaker, setActiveSpeaker] = useState(null) // name of currently speaking panelist or "You"
  const [lastSpokenTexts, setLastSpokenTexts] = useState({}) // latest text per panelist
  const [isMicOn, setIsMicOn] = useState(false)
  const recognitionRef = useRef(null)
  const chatEndRef = useRef(null)
  const voicesLoadedRef = useRef(false)
  const speakQueueRef = useRef([])
  const isSpeakingRef = useRef(false)

  // Report state
  const [report, setReport] = useState(null)
  const [finishing, setFinishing] = useState(false)

  const suggestedTopics = [
    "Should AI replace human jobs?",
    "Remote work vs Office work — which is better?",
    "Is social media helpful or harmful for society?",
    "Should coding be mandatory in schools?",
    "Startups vs Corporate jobs — which offers better growth?",
    "Is data privacy more important than convenience?",
  ];

  // Assign distinct voices to panelists
  const getVoiceForPanelist = useCallback((index) => {
    const voices = window.speechSynthesis?.getVoices() || [];
    if (voices.length === 0) return null;

    // Try to assign distinct voices by picking different ones
    const voicePreferences = [
      // Panelist 0 - Priya (female)
      (v) => v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("zira") || (v.name.toLowerCase().includes("female") && v.lang.startsWith("en")),
      // Panelist 1 - Rahul (male)
      (v) => v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("david") || (v.name.toLowerCase().includes("male") && v.lang.startsWith("en")),
      // Panelist 2 - Ananya (female, different)
      (v) => v.name.toLowerCase().includes("karen") || v.name.toLowerCase().includes("victoria") || v.name.toLowerCase().includes("moira"),
      // Panelist 3 - Vikram (male, different)
      (v) => v.name.toLowerCase().includes("alex") || v.name.toLowerCase().includes("fred") || v.name.toLowerCase().includes("mark"),
    ];

    const preferred = voices.find(voicePreferences[index]);
    if (preferred) return preferred;

    // Fallback: cycle through available English voices
    const englishVoices = voices.filter(v => v.lang.startsWith("en"));
    if (englishVoices.length > 0) {
      return englishVoices[index % englishVoices.length];
    }
    return voices[index % voices.length];
  }, []);

  // Pitch variations for distinct sound
  const getPitchForPanelist = (index) => [1.1, 0.85, 1.2, 0.75][index];
  const getRateForPanelist = (index) => [0.95, 0.9, 1.0, 0.88][index];

  // Speech queue system - speak one at a time
  const processQueue = useCallback(async () => {
    if (isSpeakingRef.current || speakQueueRef.current.length === 0) return;

    isSpeakingRef.current = true;
    const { text, name, index } = speakQueueRef.current.shift();

    setActiveSpeaker(name);
    setLastSpokenTexts(prev => ({ ...prev, [name]: text }));

    await new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getVoiceForPanelist(index);
      if (voice) utterance.voice = voice;
      utterance.pitch = getPitchForPanelist(index);
      utterance.rate = getRateForPanelist(index);
      utterance.volume = 1;

      utterance.onend = () => {
        setTimeout(resolve, 400); // pause between speakers
      };
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });

    setActiveSpeaker(null);
    isSpeakingRef.current = false;

    // Process next in queue
    if (speakQueueRef.current.length > 0) {
      processQueue();
    }
  }, [getVoiceForPanelist]);

  const queueSpeak = useCallback((text, name, panelistIndex) => {
    speakQueueRef.current.push({ text, name, index: panelistIndex });
    processQueue();
  }, [processQueue]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices();
      if (v && v.length > 0) voicesLoadedRef.current = true;
    };
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Speech recognition for voice input
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult?.[0]?.transcript || "";
      setUserInput(prev => prev + " " + transcript);
    };
    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (isMicOn) {
      try { recognitionRef.current?.stop(); } catch {}
    } else {
      try { recognitionRef.current?.start(); } catch {}
      setActiveSpeaker("You");
    }
    setIsMicOn(!isMicOn);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (phase !== "discussion") return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const handleStart = async () => {
    if (!userData) { setShowAuth(true); return; }
    const selectedTopic = customTopic.trim() || topic;
    if (!selectedTopic) return;

    setSending(true);
    try {
      const result = await axios.post(ServerUrl + "/api/gd/start",
        { topic: selectedTopic },
        { withCredentials: true }
      );
      setGdId(result.data.gdId);
      setPanelists(result.data.panelists);
      setMessages(result.data.messages);
      setTimeLeft(result.data.duration || 600);
      setPhase("discussion");

      // Queue opening messages to speak turn-by-turn
      result.data.messages.forEach((msg, i) => {
        const pIdx = result.data.panelists.findIndex(p => p.name === msg.sender);
        if (pIdx >= 0) {
          queueSpeak(msg.content, msg.sender, pIdx);
        }
      });
    } catch (err) {
      console.log(err);
    }
    setSending(false);
  }

  const handleSend = async () => {
    if (!userInput.trim() || sending) return;

    if (isMicOn) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsMicOn(false);
    }

    const msg = userInput.trim();
    setUserInput("");
    setMessages(prev => [...prev, { sender: "You", senderType: "candidate", content: msg }]);
    setActiveSpeaker(null);
    setSending(true);

    try {
      const result = await axios.post(ServerUrl + "/api/gd/respond",
        { gdId, message: msg },
        { withCredentials: true }
      );
      setMessages(prev => [...prev, ...result.data.newMessages]);

      // Queue AI responses to speak turn-by-turn
      result.data.newMessages.forEach((aiMsg) => {
        const pIdx = panelists.findIndex(p => p.name === aiMsg.sender);
        if (pIdx >= 0) {
          queueSpeak(aiMsg.content, aiMsg.sender, pIdx);
        }
      });
    } catch (err) {
      console.log(err);
    }
    setSending(false);
  }

  const handleFinish = async () => {
    if (finishing) return;
    setFinishing(true);
    window.speechSynthesis?.cancel();
    speakQueueRef.current = [];
    isSpeakingRef.current = false;
    setActiveSpeaker(null);

    try {
      const result = await axios.post(ServerUrl + "/api/gd/finish",
        { gdId },
        { withCredentials: true }
      );
      setReport(result.data);
      setPhase("report");
    } catch (err) {
      console.log(err);
    }
    setFinishing(false);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  // ============ SETUP PHASE ============
  if (phase === "setup") {
    return (
      <div className='min-h-screen bg-linear-to-br from-gray-100 to-emerald-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8 transition-colors duration-300'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className='w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:shadow-gray-900 p-10 border border-transparent dark:border-gray-700'>

          <div className='flex items-center gap-3 mb-2'>
            <button onClick={() => navigate("/")} className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition dark:text-gray-300'>
              <BsArrowLeft size={20} />
            </button>
            <div className='bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl'>
              <FaUsers className='text-emerald-600 dark:text-emerald-400 text-xl' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Group Discussion</h1>
              <p className='text-gray-500 dark:text-gray-400 text-sm'>Discuss topics with AI panelists in real-time</p>
            </div>
          </div>

          <div className='mt-8 space-y-4'>
            <label className='text-sm font-semibold text-gray-700 dark:text-gray-200 block'>Choose a topic</label>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {suggestedTopics.map((t, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setTopic(t); setCustomTopic(""); }}
                  className={`text-left p-4 rounded-xl border-2 transition text-sm ${topic === t ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'}`}>
                  {t}
                </motion.button>
              ))}
            </div>

            <div className='relative mt-4'>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => { setCustomTopic(e.target.value); setTopic(""); }}
                placeholder="Or enter your own topic..."
                className='w-full py-3 px-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
              />
            </div>

            <motion.button
              onClick={handleStart}
              disabled={(!topic && !customTopic.trim()) || sending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className='w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-full font-semibold text-lg shadow-md transition disabled:opacity-50 mt-4'>
              {sending ? (
                <span className='flex items-center justify-center gap-2'>
                  <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
                  Setting up discussion...
                </span>
              ) : "Start Group Discussion"}
            </motion.button>
          </div>

          <div className='mt-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800'>
            <p className='text-sm text-emerald-700 dark:text-emerald-300 font-medium'>👥 4 AI panelists with unique voices & perspectives</p>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Each panelist speaks with their own voice. Video-call style layout.</p>
          </div>
        </motion.div>
        {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  // ============ DISCUSSION PHASE - VIDEO CALL LAYOUT ============
  if (phase === "discussion") {
    const getPanelistLastMessage = (name) => {
      return lastSpokenTexts[name] || "";
    };

    return (
      <div className='h-screen bg-gray-900 flex flex-col overflow-hidden'>

        {/* Top Bar */}
        <div className='bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <FaUsers className='text-emerald-400 text-lg' />
            <div>
              <h2 className='font-bold text-white text-sm sm:text-base'>Group Discussion</h2>
              <p className='text-xs text-gray-400 truncate max-w-[200px] sm:max-w-[350px]'>{topic || customTopic}</p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className={`px-3 py-1.5 rounded-full font-bold text-xs ${timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-300'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
            <motion.button
              onClick={handleFinish}
              disabled={finishing}
              whileTap={{ scale: 0.95 }}
              className='bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition'>
              <FaStop size={8} /> End
            </motion.button>
          </div>
        </div>

        {/* Video Call Grid + Chat */}
        <div className='flex-1 flex flex-col lg:flex-row overflow-hidden'>

          {/* Video Grid (Left / Top) */}
          <div className='flex-1 p-3 sm:p-4'>
            <div className='grid grid-cols-2 grid-rows-3 lg:grid-rows-2 gap-3 h-full'>

              {/* 4 AI Panelist Cells */}
              {panelists.map((p, i) => {
                const config = PANELIST_CONFIG[i];
                const isSpeaking = activeSpeaker === p.name;
                const lastText = getPanelistLastMessage(p.name);

                return (
                  <motion.div
                    key={i}
                    animate={isSpeaking ? { scale: 1.02 } : { scale: 1 }}
                    className={`relative rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-300 ${
                      isSpeaking
                        ? `ring-4 ${config.ring} bg-gray-800 shadow-lg shadow-${config.bg}/20`
                        : 'bg-gray-800/80 ring-1 ring-gray-700'
                    }`}>

                    {/* Speaking indicator pulse */}
                    {isSpeaking && (
                      <div className='absolute inset-0 rounded-2xl animate-pulse opacity-10 bg-linear-to-br from-transparent to-emerald-500'></div>
                    )}

                    {/* Avatar */}
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-linear-to-br ${config.color} flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg mb-2`}>
                      {p.avatar}
                    </div>

                    {/* Name */}
                    <p className='text-white font-semibold text-xs sm:text-sm'>{p.name}</p>
                    <p className='text-gray-500 text-[10px] mt-0.5'>{p.personality?.split('.')[0]}</p>

                    {/* Speaking waveform indicator */}
                    {isSpeaking && (
                      <div className='flex gap-0.5 mt-2'>
                        {[...Array(5)].map((_, j) => (
                          <motion.div
                            key={j}
                            animate={{ height: [4, 14, 4] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: j * 0.1 }}
                            className={`w-1 rounded-full ${config.bg}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Last spoken text */}
                    {lastText && !isSpeaking && (
                      <p className='text-gray-400 text-[10px] mt-2 px-3 text-center line-clamp-2 max-w-full'>
                        "{lastText.substring(0, 80)}..."
                      </p>
                    )}

                    {/* Name badge */}
                    <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                      isSpeaking ? `${config.bg} text-white` : 'bg-gray-700/80 text-gray-300'
                    }`}>
                      {isSpeaking ? '🔊 Speaking' : p.avatar}
                    </div>
                  </motion.div>
                );
              })}

              {/* YOU Cell - spans full width on bottom row */}
              <motion.div
                animate={activeSpeaker === "You" || isMicOn ? { scale: 1.01 } : { scale: 1 }}
                className={`col-span-2 relative rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-300 ${
                  activeSpeaker === "You" || isMicOn
                    ? 'ring-4 ring-white/60 bg-gray-800 shadow-lg'
                    : 'bg-gray-800/80 ring-1 ring-gray-700'
                }`}>

                <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-linear-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-xl font-bold shadow-lg border-2 border-gray-600 mb-2'>
                  {userData?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <p className='text-white font-semibold text-sm'>You</p>

                {isMicOn && (
                  <div className='flex gap-0.5 mt-2'>
                    {[...Array(5)].map((_, j) => (
                      <motion.div
                        key={j}
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.4, repeat: Infinity, delay: j * 0.08 }}
                        className='w-1 rounded-full bg-white'
                      />
                    ))}
                  </div>
                )}

                <div className='absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-700/80 text-gray-300'>
                  {isMicOn ? '🔊 Speaking' : 'You'}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Chat Panel (Right / Bottom) */}
          <div className='w-full lg:w-[380px] bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col flex-shrink-0 max-h-[40vh] lg:max-h-full'>

            {/* Chat header */}
            <div className='px-4 py-3 border-b border-gray-700 flex-shrink-0'>
              <p className='text-white text-sm font-semibold'>💬 Discussion Chat</p>
              <p className='text-gray-500 text-[10px]'>{messages.length} messages</p>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto px-4 py-3 space-y-3'>
              {messages.map((msg, i) => {
                const pIdx = panelists.findIndex(p => p.name === msg.sender);
                const config = pIdx >= 0 ? PANELIST_CONFIG[pIdx] : null;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${msg.senderType === 'candidate' ? 'flex justify-end' : ''}`}>

                    {msg.senderType === 'ai' ? (
                      <div className='flex gap-2'>
                        <div className={`w-7 h-7 rounded-full ${config?.bg || 'bg-gray-600'} text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5`}>
                          {panelists[pIdx]?.avatar || "AI"}
                        </div>
                        <div>
                          <p className={`text-[10px] font-semibold ${config?.textColor || 'text-gray-400'} mb-0.5`}>{msg.sender}</p>
                          <div className='bg-gray-700 rounded-xl rounded-tl-sm px-3 py-2 max-w-[280px]'>
                            <p className='text-gray-200 text-xs leading-relaxed'>{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className='bg-emerald-600 rounded-xl rounded-br-sm px-3 py-2 max-w-[240px]'>
                        <p className='text-white text-xs leading-relaxed'>{msg.content}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {sending && (
                <div className='flex gap-2 items-center'>
                  <div className='w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center'>
                    <BsRobot size={12} />
                  </div>
                  <div className='bg-gray-700 rounded-xl px-3 py-2 flex gap-1'>
                    <span className='thinking-dot w-1.5 h-1.5 bg-gray-400 rounded-full'></span>
                    <span className='thinking-dot w-1.5 h-1.5 bg-gray-400 rounded-full'></span>
                    <span className='thinking-dot w-1.5 h-1.5 bg-gray-400 rounded-full'></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className='border-t border-gray-700 px-3 py-3 flex-shrink-0'>
              <div className='flex gap-2'>
                <motion.button
                  onClick={toggleMic}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition flex-shrink-0 ${
                    isMicOn ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}>
<<<<<<< HEAD
                   <FaMicrophone size={14} />
=======
                  <FaMicrophone size={14} />
>>>>>>> b9b0bc8effeae2b922580bc74c46464e9cb1a902
                </motion.button>

                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Share your viewpoint..."
                  disabled={sending}
                  className='flex-1 py-2 px-4 bg-gray-700 text-white rounded-full outline-none border border-gray-600 focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 text-sm placeholder-gray-400'
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!userInput.trim() || sending}
                  whileTap={{ scale: 0.9 }}
                  className='w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition disabled:opacity-50 flex-shrink-0'>
                  <BsSend size={14} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ REPORT PHASE ============
  if (phase === "report" && report) {
    const dimensions = [
      { label: "Leadership", value: report.leadership, emoji: "👑" },
      { label: "Communication", value: report.communication, emoji: "💬" },
      { label: "Relevance", value: report.relevance, emoji: "🎯" },
      { label: "Assertiveness", value: report.assertiveness, emoji: "💪" },
      { label: "Teamwork", value: report.teamwork, emoji: "🤝" },
    ];

    return (
      <div className='min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 px-4 sm:px-8 py-8 transition-colors duration-300'>
        <div className='max-w-4xl mx-auto'>

          <div className='flex items-center gap-4 mb-8'>
            <button onClick={() => navigate("/")} className='p-3 rounded-full bg-white dark:bg-gray-800 shadow dark:shadow-gray-900 hover:shadow-md transition'>
              <BsArrowLeft className='text-gray-600 dark:text-gray-300' size={18} />
            </button>
            <div>
              <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>GD Performance Report</h1>
              <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>{topic || customTopic}</p>
            </div>
          </div>

          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-8 mb-6 text-center border border-transparent dark:border-gray-700'>
            <div className='w-28 h-28 mx-auto mb-4'>
              <CircularProgressbar
                value={(report.finalScore / 10) * 100}
                text={`${report.finalScore}/10`}
                styles={buildStyles({
                  textSize: "18px",
                  pathColor: report.finalScore >= 7 ? "#10b981" : report.finalScore >= 4 ? "#f59e0b" : "#ef4444",
                  textColor: darkMode ? "#f3f4f6" : "#111827",
                  trailColor: darkMode ? "#374151" : "#e5e7eb",
                })}
              />
            </div>
            <p className='text-gray-500 dark:text-gray-400'>Contributions: {report.totalContributions}</p>
          </motion.div>

          {/* Dimensions */}
          <div className='grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6'>
            {dimensions.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className='bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900 p-4 text-center border border-transparent dark:border-gray-700'>
                <div className='text-2xl mb-2'>{d.emoji}</div>
                <div className='text-2xl font-bold text-gray-800 dark:text-white'>{d.value}</div>
                <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{d.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Feedback */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-6 mb-6 border border-transparent dark:border-gray-700'>
            <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3'>Overall Feedback</h3>
            <p className='text-gray-600 dark:text-gray-400 leading-relaxed'>{report.feedback}</p>
          </motion.div>

          {/* Strengths & Improvements */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-6 border border-transparent dark:border-gray-700'>
              <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4'>✅ Strengths</h3>
              <div className='space-y-2'>
                {report.strengths?.map((s, i) => (
                  <div key={i} className='bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-sm text-gray-700 dark:text-gray-300'>• {s}</div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900 p-6 border border-transparent dark:border-gray-700'>
              <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4'>📈 Improvements</h3>
              <div className='space-y-2'>
                {report.improvements?.map((imp, i) => (
                  <div key={i} className='bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-sm text-gray-700 dark:text-gray-300'>• {imp}</div>
                ))}
              </div>
            </motion.div>
          </div>

          <button
            onClick={() => navigate("/")}
            className='w-full bg-black dark:bg-emerald-600 text-white py-3 rounded-full font-semibold hover:opacity-90 transition'>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default GDPage
