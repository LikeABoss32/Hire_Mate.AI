import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const filepath = req.file.path

    const fileBuffer = await fs.promises.readFile(filepath)
    const uint8Array = new Uint8Array(fileBuffer)

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }


    resumeText = resumeText
      .replace(/\s+/g, " ")
      .trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
      },
      {
        role: "user",
        content: resumeText
      }
    ];


    const aiResponse = await askAi(messages)

    const parsed = JSON.parse(aiResponse);

    fs.unlinkSync(filepath)


    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText
    });

  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ message: error.message });
  }
};


export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, interviewType, resumeText, projects, skills } = req.body

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();
    interviewType = interviewType?.trim() || "mock";

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." })
    }

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    const projectText = Array.isArray(projects) && projects.length
      ? projects.join(", ")
      : "None";

    const skillsText = Array.isArray(skills) && skills.length
      ? skills.join(", ")
      : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
    Role: ${role}
    Experience: ${experience}
    Interview Mode: ${mode}
    Projects: ${projectText}
    Skills: ${skillsText}
    Resume: ${safeResume}
    `;

    if (!userPrompt.trim()) {
      return res.status(400).json({
        message: "Prompt content is empty."
      });
    }

    const messages = [
      {
        role: "system",
        content: `
You are a senior professional interviewer conducting a ${mode} interview for a ${role} position.

The candidate has ${experience} of experience.
If Interview Mode is "HR":

Ask questions in a friendly, conversational, and professional tone
Focus on evaluating:
• Leadership
• Communication skills
• Team collaboration
• Problem-solving approach
• Conflict resolution
• Adaptability
• Decision-making
• Ownership and responsibility
Questions MUST be situational and behavioral:
• Use real-world scenarios
• Encourage storytelling
• Assess how the candidate thinks and acts
Use patterns like:
• "Tell me about a time when..."
• "Can you describe a situation where..."
• "How would you handle..."
• "What would you do if..."
• "How have you demonstrated..."
Make questions feel human, not robotic
DO NOT ask deep technical or coding questions
You MAY include only one light technical question related to experience
Ensure questions reveal:
• Leadership potential
• Emotional intelligence
• Decision-making ability
• Workplace behavior
Generate exactly 7 UNIQUE interview questions every time.

IMPORTANT:

Questions MUST NOT repeat common templates
Avoid generic phrases like "Tell me about yourself"
Make each question feel natural and slightly different each time
Use variation in wording and scenarios

Question 1 → Tell me about a time when you handled a difficult situation in your team and what actions you took.
Question 2 →Describe a situation where you took initiative or led a task without being asked.
Question 3 → How would you handle a situation where your team is not meeting deadlines?
Question 4 → Can you share an experience where clear communication helped resolve a problem?
Question 5 → Tell me about a challenge you faced and how you approached solving it.
Question 6 → Describe a time when you had to make an important decision under pressure.
Question 7 → How have you adapted to changes in your work or project environment?

If Interview Mode is "Technical":
Generate exactly 7 interview questions that are DIRECTLY RELEVANT to the candidate's resume, projects, and skills.

QUESTION TYPES TO INCLUDE:
1. Resume-specific: Ask about specific projects, technologies, or experiences mentioned in their resume.
2. Technical depth: Deep-dive into their listed skills with practical scenarios.
3. Behavioral/Situational: "Tell me about a time when..." based on their experience level.
4. Problem-solving: Real-world scenarios they'd face in the ${role} role.
5. System design / Architecture: For experienced candidates, ask design questions relevant to their domain.

STRICT RULES:
- Each question must be 15 to 30 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations or extra text.
- One question per line only.
- Keep language natural and conversational.
- Questions MUST reference specific details from the resume/skills/projects when available.
- Questions should test real-world readiness for the ${role} job.
- If resume mentions specific projects, ASK about those projects.
- If skills are listed, create scenario questions using those technologies.

Difficulty progression:
Question 1 → easy (warm-up, about their background)
Question 2 → easy (about a specific skill from resume)
Question 3 → medium (scenario-based using their tech stack)
Question 4 → medium (behavioral, relevant to their experience)
Question 5 → medium-hard (problem-solving in their domain)
Question 6 → hard (deep technical or system design)
Question 7 → hard (complex real-world challenge)
`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];


    const aiResponse = await askAi(messages)

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({
        message: "AI returned empty response."
      });
    }

    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 7);

    if (questionsArray.length === 0) {
      return res.status(500).json({
        message: "AI failed to generate questions."
      });
    }

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      interviewType,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "medium-hard", "hard", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120, 120, 150][index],
      }))
    })

    res.json({
      interviewId: interview._id,
      userName: user.name,
      questions: interview.questions
    });
  } catch (error) {
    return res.status(500).json({message:`failed to create interview ${error}`})
  }
}


export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body

    const interview = await Interview.findById(interviewId)
    const question = interview.questions[questionIndex]

    // If no answer or skipped
    if (!answer || answer.trim() === "") {
      question.score = 0;
      question.feedback = "No answer was provided for this question.";
      question.detailedFeedback = "The candidate did not provide an answer. This is an area that needs attention.";
      question.answer = "";
      question.skipped = true;

      await interview.save();

      return res.json({
        feedback: question.feedback,
        conversationalFeedback: "No worries, let's move on to the next one."
      });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.detailedFeedback = "The candidate exceeded the time limit. Practice time management for interview readiness.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback,
        conversationalFeedback: "Looks like we ran out of time on that one."
      });
    }


    const messages = [
      {
        role: "system",
        content: `
You are an expert professional interviewer evaluating a candidate's answer.

Evaluate the answer thoroughly and fairly.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, structured, and easy to understand?
3. Correctness – Is the answer accurate, relevant, complete, and technically sound?

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Provide DETAILED evaluation:

- feedback: A short 10-15 word professional feedback summary.
- detailedFeedback: A 2-3 sentence thorough analysis of the answer quality, what was good, what was missing.
- idealAnswer: A brief 1-2 sentence description of what an ideal answer would include.
- strengths: Array of 2-3 specific things the candidate did well.
- improvements: Array of 2-3 specific areas where the candidate can improve.
- conversationalFeedback: A natural, warm 5-10 word reaction (e.g., "That's a solid answer, well done!" or "Interesting perspective, though I'd add...")

Return ONLY valid JSON:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short feedback",
  "detailedFeedback": "thorough analysis paragraph",
  "idealAnswer": "what ideal answer includes",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "conversationalFeedback": "warm natural reaction"
}
`
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];


    const aiResponse = await askAi(messages)

    let parsed;
    try {
      // Handle markdown-wrapped JSON
      let cleaned = aiResponse.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", aiResponse);
      return res.status(500).json({ message: "AI response parsing failed" });
    }

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    question.detailedFeedback = parsed.detailedFeedback || "";
    question.idealAnswer = parsed.idealAnswer || "";
    question.strengths = parsed.strengths || [];
    question.improvements = parsed.improvements || [];
    question.skipped = false;
    await interview.save();


    return res.status(200).json({
      feedback: parsed.feedback,
      conversationalFeedback: parsed.conversationalFeedback || "Noted, let's continue."
    })
  } catch (error) {
    return res.status(500).json({message:`failed to submit answer ${error}`})
  }
}


export const finishInterview = async (req,res) => {
  try {
    const {interviewId} = req.body
    const interview = await Interview.findById(interviewId)
    if(!interview){
      return res.status(400).json({message:"failed to find Interview"})
    }

    // Only count answered (non-skipped) questions
    const answeredQuestions = interview.questions.filter(q => !q.skipped && q.answer && q.answer.trim() !== "");
    const totalAnswered = answeredQuestions.length;
    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    answeredQuestions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalAnswered ? totalScore / totalAnswered : 0;
    const avgConfidence = totalAnswered ? totalConfidence / totalAnswered : 0;
    const avgCommunication = totalAnswered ? totalCommunication / totalAnswered : 0;
    const avgCorrectness = totalAnswered ? totalCorrectness / totalAnswered : 0;

    // Determine readiness level
    let readinessLevel = "Not Ready";
    if (finalScore >= 8) readinessLevel = "Interview Ready";
    else if (finalScore >= 6) readinessLevel = "Almost Ready";
    else if (finalScore >= 4) readinessLevel = "Needs Work";

    // Generate overall analysis with AI
    const questionSummary = interview.questions.map((q, i) => 
      `Q${i+1}: "${q.question}" - Score: ${q.score}/10 - ${q.skipped ? "SKIPPED" : `Answer given, Feedback: ${q.feedback}`}`
    ).join("\n");

    let overallStrengths = [];
    let overallWeaknesses = [];
    let recommendations = [];

    try {
      const analysisMessages = [
        {
          role: "system",
          content: `
You are a career coach analyzing an interview performance.

Based on the question-by-question results, provide:
1. overallStrengths: 3-4 specific strengths demonstrated
2. overallWeaknesses: 3-4 specific areas needing improvement
3. recommendations: 4-5 actionable recommendations for improvement

Return ONLY valid JSON:
{
  "overallStrengths": ["strength1", "strength2", "strength3"],
  "overallWeaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": ["rec1", "rec2", "rec3", "rec4"]
}
`
        },
        {
          role: "user",
          content: `
Role: ${interview.role}
Experience: ${interview.experience}
Mode: ${interview.mode}
Final Score: ${finalScore.toFixed(1)}/10
Questions Answered: ${totalAnswered}/${totalQuestions}

${questionSummary}
`
        }
      ];

      const analysisResponse = await askAi(analysisMessages);
      let cleaned = analysisResponse.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      const analysisData = JSON.parse(cleaned);
      overallStrengths = analysisData.overallStrengths || [];
      overallWeaknesses = analysisData.overallWeaknesses || [];
      recommendations = analysisData.recommendations || [];
    } catch (e) {
      console.error("Analysis generation failed:", e);
      // Provide fallback analysis
      overallStrengths = ["Completed the interview session"];
      overallWeaknesses = ["Review all question areas for improvement"];
      recommendations = ["Practice more mock interviews", "Focus on weak areas"];
    }

    interview.finalScore = finalScore;
    interview.status = "completed";
    interview.overallStrengths = overallStrengths;
    interview.overallWeaknesses = overallWeaknesses;
    interview.recommendations = recommendations;
    interview.readinessLevel = readinessLevel;

    await interview.save();

    return res.status(200).json({
      interviewType: interview.interviewType,
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      readinessLevel,
      overallStrengths,
      overallWeaknesses,
      recommendations,
      totalAnswered,
      totalQuestions,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        detailedFeedback: q.detailedFeedback || "",
        idealAnswer: q.idealAnswer || "",
        strengths: q.strengths || [],
        improvements: q.improvements || [],
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
        skipped: q.skipped || false,
      })),
    })
  } catch (error) {
    return res.status(500).json({message:`failed to finish Interview ${error}`})
  }
}


export const getMyInterviews = async (req,res) => {
  try {
    const interviews = await Interview.find({userId:req.userId})
    .sort({ createdAt: -1 })
    .select("role experience mode finalScore status createdAt readinessLevel");

    return res.status(200).json(interviews)

  } catch (error) {
     return res.status(500).json({message:`failed to find currentUser Interview ${error}`})
  }
}

export const getInterviewReport = async (req,res) => {
  try {
    const interview = await Interview.findById(req.params.id)

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const answeredQuestions = interview.questions.filter(q => !q.skipped && q.answer && q.answer.trim() !== "");
    const totalAnswered = answeredQuestions.length;
    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    answeredQuestions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const avgConfidence = totalAnswered ? totalConfidence / totalAnswered : 0;
    const avgCommunication = totalAnswered ? totalCommunication / totalAnswered : 0;
    const avgCorrectness = totalAnswered ? totalCorrectness / totalAnswered : 0;

    return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      readinessLevel: interview.readinessLevel || "Not Ready",
      overallStrengths: interview.overallStrengths || [],
      overallWeaknesses: interview.overallWeaknesses || [],
      recommendations: interview.recommendations || [],
      totalAnswered,
      totalQuestions,
      role: interview.role,
      experience: interview.experience,
      mode: interview.mode,
      interviewType: interview.interviewType,
      questionWiseScore: interview.questions.map(q => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        detailedFeedback: q.detailedFeedback || "",
        idealAnswer: q.idealAnswer || "",
        strengths: q.strengths || [],
        improvements: q.improvements || [],
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
        skipped: q.skipped || false,
      }))
    });

  } catch (error) {
    return res.status(500).json({message:`failed to find currentUser Interview report ${error}`})
  }
}

export const logCheatingEvent = async (req, res) => {
  try {
    const { interviewId, eventType, details } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    interview.cheatingLogs.push({
      timestamp: new Date(),
      eventType,
      details
    });

    await interview.save();
    return res.status(200).json({ message: "Event logged successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to log cheating event: ${error}` });
  }
};
