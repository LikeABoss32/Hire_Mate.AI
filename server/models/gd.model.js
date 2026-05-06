import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: String,       // "candidate" or AI panelist name
  senderType: {
    type: String,
    enum: ["candidate", "ai"],
    required: true
  },
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const gdSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  panelists: [{
    name: String,
    personality: String,
    avatar: String
  }],
  messages: [messageSchema],
  duration: { type: Number, default: 600 }, // seconds
  
  // Scores
  finalScore: { type: Number, default: 0 },
  leadership: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  relevance: { type: Number, default: 0 },
  assertiveness: { type: Number, default: 0 },
  teamwork: { type: Number, default: 0 },
  
  feedback: String,
  strengths: [String],
  improvements: [String],
  
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  }
}, { timestamps: true });

const GD = mongoose.model("GD", gdSchema);

export default GD;
