import React from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash, FaForward, FaStop, FaRedo } from "react-icons/fa";
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import axios from "axios"
import { ServerUrl } from '../App'
import { BsArrowRight, BsRobot } from 'react-icons/bs'

function Step2Interview({ interviewData, onFinish }) {
  const interviewId = interviewData?.interviewId;
  const questions = interviewData?.questions || [];
  const userName = interviewData?.userName || "";

  if (!interviewData || !questions?.length) {
    return null;
  }

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [conversationalFeedback, setConversationalFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions?.[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const videoRef = useRef(null);
  const currentQuestion = questions?.[currentIndex];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const isFemalePreferred = Math.random() < 0.5;

      const isFemale = (v) => {
        const name = v.name.toLowerCase();
        return name.includes("zira") || name.includes("samantha") || name.includes("female") || name.includes("victoria") || name.includes("karen") || name.includes("moira") || name.includes("tessa");
      };

      const isMale = (v) => {
        const name = v.name.toLowerCase();
        return name.includes("david") || name.includes("mark") || name.includes("male") || name.includes("alex") || name.includes("daniel") || name.includes("rishi") || name.includes("aaron");
      };

      const femaleVoice = voices.find(isFemale);
      const maleVoice = voices.find(isMale);

      if (isFemalePreferred) {
        if (femaleVoice) {
          setSelectedVoice(femaleVoice);
          setVoiceGender("female");
        } else {
          setSelectedVoice(voices[0]);
          setVoiceGender("female"); // Assume default is female
        }
      } else {
        if (maleVoice) {
          setSelectedVoice(maleVoice);
          setVoiceGender("male");
        } else if (femaleVoice) {
          setSelectedVoice(femaleVoice);
          setVoiceGender("female");
        } else {
          setSelectedVoice(voices[0]);
          setVoiceGender("female"); // Assume default is female if no specific male voice found
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [])

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  /* ---------------- SPEAK FUNCTION ---------------- */
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic()
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) videoRef.current.currentTime = 0;
        setIsAIPlaying(false);

        if (isMicOn) {
          startMic();
        }
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };


  useEffect(() => {
    if (!selectedVoice) return;

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, great to meet you today. I hope you're feeling confident and ready.`
        );
        await speakText(
          "I'll ask you a series of questions. Feel free to skip any question or finish the interview anytime. Let's begin."
        );
        setIsIntroPhase(false)
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800));

        if (currentIndex === questions?.length - 1) {
          await speakText("Alright, this is the final question. Take your time.");
        } else if (currentIndex > 0) {
          const transitions = [
            "Great, here's the next one.",
            "Moving on.",
            "Let's continue.",
            "Next question for you.",
          ];
          await speakText(transitions[currentIndex % transitions.length]);
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }
    }

    runIntro()
  }, [selectedVoice, isIntroPhase, currentIndex])


  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0;
        }
        return prev - 1
      })
    }, 1000);

    return () => clearInterval(timer)
  }, [isIntroPhase, currentIndex])

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);


  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let transcript = "";
      if (event?.results?.length > 0) {
        const lastResult = event.results[event.results.length - 1];
        transcript = lastResult?.[0]?.transcript || "";
      }
      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
  }, []);


  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch { }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { }
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };


  const submitAnswer = async () => {
    if (isSubmitting) return;
    if (!currentQuestion) return;

    stopMic()
    setIsSubmitting(true)
    setIsAIThinking(true)

    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken: (currentQuestion?.timeLimit || 60) - timeLeft,
      }, { withCredentials: true })

      setFeedback(result.data.feedback)
      setConversationalFeedback(result.data.conversationalFeedback || "")
      setIsAIThinking(false)

      // Speak the conversational feedback first, then formal feedback
      if (result.data.conversationalFeedback) {
        await speakText(result.data.conversationalFeedback);
      }
      await speakText(result.data.feedback);

      setIsSubmitting(false)
    } catch (error) {
      console.log(error)
      setIsSubmitting(false)
      setIsAIThinking(false)
    }
  }

  const skipQuestion = async () => {
    if (isSubmitting) return;
    stopMic();

    // Submit empty answer for skip
    try {
      await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer: "",
        timeTaken: 0,
      }, { withCredentials: true })
    } catch (e) {
      console.log(e);
    }

    await speakText("No problem, let's skip this one.");
    handleNext();
  }

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    setConversationalFeedback("");

    if (currentIndex + 1 >= questions?.length) {
      finishInterview();
      return;
    }

    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);
  }

  const finishInterview = async () => {
    stopMic()
    setIsMicOn(false)
    window.speechSynthesis.cancel();
    setShowFinishConfirm(false)

    try {
      const result = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, { withCredentials: true })
      onFinish(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  // Auto-submit when time runs out
  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer()
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch { }
      }
      window.speechSynthesis.cancel();
    };
  }, []);


  return (
    <div className='min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-350 min-h-[80vh] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row overflow-hidden relative'>

        {/* Finish Interview Button - Always visible */}
        <motion.button
          onClick={() => setShowFinishConfirm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='absolute top-4 right-4 z-20 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg transition'>
          <FaStop size={10} /> Finish Interview
        </motion.button>

        {/* Finish Confirmation Modal */}
        {showFinishConfirm && (
          <div className='absolute inset-0 z-30 bg-black/30 backdrop-blur-sm flex items-center justify-center'>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className='bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center'>
              <h3 className='text-xl font-bold text-gray-800 dark:text-white mb-3'>End Interview?</h3>
              <p className='text-gray-500 dark:text-gray-400 text-sm mb-6'>
                You've answered {currentIndex + (feedback ? 1 : 0)} of {questions.length} questions.
                Unanswered questions will be marked as skipped.
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowFinishConfirm(false)}
                  className='flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium'>
                  Continue
                </button>
                <button
                  onClick={finishInterview}
                  className='flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium'>
                  End Now
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Video Section */}
        <div className='w-full lg:w-[35%] bg-white dark:bg-gray-800 flex flex-col items-center p-6 space-y-6 border-r border-gray-200 dark:border-gray-700'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl relative'>
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
            {isAIPlaying && (
              <div className='absolute bottom-3 left-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full animate-pulse font-medium'>
                🎙 Speaking...
              </div>
            )}
            {isAIThinking && !isAIPlaying && (
              <div className='absolute bottom-3 left-3 bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1'>
                <span className='thinking-dot w-1.5 h-1.5 bg-white rounded-full inline-block'></span>
                <span className='thinking-dot w-1.5 h-1.5 bg-white rounded-full inline-block'></span>
                <span className='thinking-dot w-1.5 h-1.5 bg-white rounded-full inline-block'></span>
                <span className='ml-1'>Thinking</span>
              </div>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='w-full max-w-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 dark:text-gray-200 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </motion.div>
          )}

          {/* Timer & Status */}
          <div className='w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>Interview Status</span>
              {isAIPlaying && <span className='text-sm font-semibold text-emerald-600'>AI Speaking</span>}
              {isAIThinking && !isAIPlaying && <span className='text-sm font-semibold text-amber-600'>AI Thinking</span>}
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

            <div className='flex justify-center'>
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

            {/* Progress Bar */}
            <div>
              <div className='flex justify-between text-xs text-gray-400 mb-2'>
                <span>Progress</span>
                <span>{currentIndex + 1}/{questions?.length}</span>
              </div>
              <div className='bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden'>
                <motion.div
                  className='bg-emerald-500 h-full rounded-full'
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / questions?.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Text Section */}
        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative pt-14'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg'>
              <BsRobot size={20} className='text-emerald-600' />
            </div>
            <h2 className='text-xl sm:text-2xl font-bold text-emerald-600'>
              AI Smart Interview
            </h2>
          </div>

          {!isIntroPhase && (
            <div className='relative mb-6 bg-gray-50 dark:bg-gray-700 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm'>
              <div className='flex justify-between items-center mb-2'>
                <p className='text-xs sm:text-sm text-gray-400'>
                  Question {currentIndex + 1} of {questions?.length}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${currentQuestion?.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                  currentQuestion?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                  {currentQuestion?.difficulty}
                </span>
              </div>
              <div className='text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 leading-relaxed'>{currentQuestion?.question}</div>
            </div>
          )}

          <textarea
            placeholder="Type your answer here or speak..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 transition text-gray-800 dark:text-white dark:placeholder-gray-400 min-h-[120px]" />


          {!feedback ? (
            <div className='flex items-center gap-3 mt-6'>
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-lg transition ${isMicOn ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </motion.button>

              <motion.button
                onClick={skipQuestion}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className='px-5 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold flex items-center gap-2 disabled:opacity-50'>
                <FaForward size={14} /> Skip
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className='flex-1 bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:opacity-50'>
                {isSubmitting ? (
                  <span className='flex items-center justify-center gap-2'>
                    <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
                    Evaluating...
                  </span>
                ) : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='mt-6 space-y-3'>

              {conversationalFeedback && (
                <div className='bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl'>
                  <p className='text-blue-700 dark:text-blue-300 font-medium text-sm'>💬 {conversationalFeedback}</p>
                </div>
              )}

              <div className='bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl shadow-sm'>
                <p className='text-emerald-700 dark:text-emerald-300 font-medium mb-4'>{feedback}</p>

                <div className='flex gap-3'>
                  <button
                    onClick={() => {
                      window.speechSynthesis.cancel();
                      setAnswer("");
                      setFeedback("");
                      setConversationalFeedback("");
                      setTimeLeft(currentQuestion?.timeLimit || 60);
                      setIsSubmitting(false);
                      if (isMicOn) {
                        setTimeout(() => startMic(), 300);
                      }
                    }}
                    className='flex-1 bg-white dark:bg-gray-700 border-2 border-amber-400 text-amber-600 dark:text-amber-400 py-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition flex items-center justify-center gap-2 font-semibold'>
                    <FaRedo size={14} /> Re-answer
                  </button>

                  <button
                    onClick={handleNext}
                    className='flex-1 bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-2 font-semibold'>
                    {currentIndex + 1 >= questions?.length ? "View Results" : "Next Question"} <BsArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step2Interview
