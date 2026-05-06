import { askAi } from "../services/openRouter.service.js";
import GD from "../models/gd.model.js";

const AI_PANELISTS = [
  { name: "Priya Sharma", personality: "Analytical and data-driven. Prefers structured arguments with evidence.", avatar: "PS" },
  { name: "Rahul Verma", personality: "Creative thinker. Often brings unconventional perspectives and challenges assumptions.", avatar: "RV" },
  { name: "Ananya Iyer", personality: "Empathetic and people-focused. Emphasizes human impact and practical implementation.", avatar: "AI" },
  { name: "Vikram Singh", personality: "Direct and assertive. Focuses on business outcomes and efficiency.", avatar: "VS" }
];

export const startGD = async (req, res) => {
  try {
    const { topic } = req.body;
    const userId = req.userId;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: "Topic is required" });
    }

    // Generate initial viewpoints from AI panelists
    const messages = [
      {
        role: "system",
        content: `
You are simulating a Group Discussion with 4 panelists. The topic is: "${topic}"

Each panelist has a distinct personality:
1. ${AI_PANELISTS[0].name}: ${AI_PANELISTS[0].personality}
2. ${AI_PANELISTS[1].name}: ${AI_PANELISTS[1].personality}
3. ${AI_PANELISTS[2].name}: ${AI_PANELISTS[2].personality}
4. ${AI_PANELISTS[3].name}: ${AI_PANELISTS[3].personality}

Generate the opening statements for each panelist. Each statement should be 2-3 sentences, reflecting their personality and providing a unique perspective on the topic.

Return ONLY valid JSON:
{
  "statements": [
    {"name": "${AI_PANELISTS[0].name}", "content": "opening statement"},
    {"name": "${AI_PANELISTS[1].name}", "content": "opening statement"},
    {"name": "${AI_PANELISTS[2].name}", "content": "opening statement"},
    {"name": "${AI_PANELISTS[3].name}", "content": "opening statement"}
  ]
}
`
      },
      {
        role: "user",
        content: `Topic: ${topic}`
      }
    ];

    const aiResponse = await askAi(messages);
    let cleaned = aiResponse.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }
    const parsed = JSON.parse(cleaned);

    const initialMessages = parsed.statements.map(s => ({
      sender: s.name,
      senderType: "ai",
      content: s.content
    }));

    const gd = await GD.create({
      userId,
      topic,
      panelists: AI_PANELISTS,
      messages: initialMessages,
      duration: 600
    });

    return res.status(201).json({
      gdId: gd._id,
      topic: gd.topic,
      panelists: gd.panelists,
      messages: gd.messages,
      duration: gd.duration
    });

  } catch (error) {
    console.error("Start GD error:", error);
    return res.status(500).json({ message: `Failed to start GD: ${error.message}` });
  }
};

export const respondGD = async (req, res) => {
  try {
    const { gdId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const gd = await GD.findById(gdId);
    if (!gd) {
      return res.status(404).json({ message: "GD session not found" });
    }

    // Add candidate message
    gd.messages.push({
      sender: "You",
      senderType: "candidate",
      content: message
    });

    // Build conversation context
    const conversationContext = gd.messages.slice(-10).map(m => 
      `${m.sender}: ${m.content}`
    ).join("\n");

    // All panelists may respond contextually
    const messages = [
      {
        role: "system",
        content: `
You are simulating a Group Discussion. Topic: "${gd.topic}"

The candidate just shared their viewpoint. Now 2 to 3 panelists will respond naturally based on relevance.

Available panelists:
1. ${AI_PANELISTS[0].name}: ${AI_PANELISTS[0].personality}
2. ${AI_PANELISTS[1].name}: ${AI_PANELISTS[1].personality}
3. ${AI_PANELISTS[2].name}: ${AI_PANELISTS[2].personality}
4. ${AI_PANELISTS[3].name}: ${AI_PANELISTS[3].personality}

Rules:
- Pick 2-3 panelists who would NATURALLY respond to the candidate's point.
- Each response should be 1-3 sentences.
- Responses should engage with the candidate's point — agree, disagree, build on it, or challenge it.
- Each panelist MUST adapt their response based on what was said previously in the discussion.
- Stay in character with each panelist's personality.
- Keep it natural and conversational.

Return ONLY valid JSON:
{
  "responses": [
    {"name": "panelist name", "content": "response"},
    ...
  ]
}
`
      },
      {
        role: "user",
        content: `
Recent discussion:
${conversationContext}

Candidate's latest point: ${message}
`
      }
    ];

    const aiResponse = await askAi(messages);
    let cleaned = aiResponse.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }
    const parsed = JSON.parse(cleaned);

    const aiMessages = parsed.responses.map(r => ({
      sender: r.name,
      senderType: "ai",
      content: r.content
    }));

    gd.messages.push(...aiMessages);
    await gd.save();

    return res.status(200).json({
      newMessages: aiMessages
    });

  } catch (error) {
    console.error("Respond GD error:", error);
    return res.status(500).json({ message: `Failed to respond in GD: ${error.message}` });
  }
};

export const finishGD = async (req, res) => {
  try {
    const { gdId } = req.body;

    const gd = await GD.findById(gdId);
    if (!gd) {
      return res.status(404).json({ message: "GD session not found" });
    }

    const candidateMessages = gd.messages.filter(m => m.senderType === "candidate");
    const allMessages = gd.messages.map(m => `${m.sender}: ${m.content}`).join("\n");

    const messages = [
      {
        role: "system",
        content: `
You are evaluating a candidate's performance in a Group Discussion on the topic: "${gd.topic}"

Score the candidate on these dimensions (0 to 10):
1. Leadership - Did they take initiative, guide the discussion, or introduce new angles?
2. Communication - Were they clear, articulate, and well-structured?
3. Relevance - Were their points relevant to the topic?
4. Assertiveness - Did they confidently express their views without being aggressive?
5. Teamwork - Did they engage with others' points and build on them?

The candidate made ${candidateMessages.length} contributions to the discussion.

Return ONLY valid JSON:
{
  "leadership": number,
  "communication": number,
  "relevance": number,
  "assertiveness": number,
  "teamwork": number,
  "finalScore": number,
  "feedback": "2-3 sentence overall feedback",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"]
}
`
      },
      {
        role: "user",
        content: `
Full discussion transcript:
${allMessages}
`
      }
    ];

    const aiResponse = await askAi(messages);
    let cleaned = aiResponse.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }
    const parsed = JSON.parse(cleaned);

    gd.leadership = parsed.leadership;
    gd.communication = parsed.communication;
    gd.relevance = parsed.relevance;
    gd.assertiveness = parsed.assertiveness;
    gd.teamwork = parsed.teamwork;
    gd.finalScore = parsed.finalScore;
    gd.feedback = parsed.feedback;
    gd.strengths = parsed.strengths || [];
    gd.improvements = parsed.improvements || [];
    gd.status = "completed";

    await gd.save();

    return res.status(200).json({
      finalScore: parsed.finalScore,
      leadership: parsed.leadership,
      communication: parsed.communication,
      relevance: parsed.relevance,
      assertiveness: parsed.assertiveness,
      teamwork: parsed.teamwork,
      feedback: parsed.feedback,
      strengths: parsed.strengths,
      improvements: parsed.improvements,
      totalContributions: candidateMessages.length
    });

  } catch (error) {
    console.error("Finish GD error:", error);
    return res.status(500).json({ message: `Failed to finish GD: ${error.message}` });
  }
};

export const getMyGDs = async (req, res) => {
  try {
    const gds = await GD.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("topic finalScore status createdAt");

    return res.status(200).json(gds);
  } catch (error) {
    return res.status(500).json({ message: `Failed to get GDs: ${error.message}` });
  }
};
