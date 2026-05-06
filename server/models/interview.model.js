import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
  question: String,
  difficulty: String,
  timeLimit: Number,
  answer: String,
  feedback: String,
  detailedFeedback: String,
  idealAnswer: String,
  strengths: [String],
  improvements: [String],
  score: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 },
  skipped: { type: Boolean, default: false },
})


const interviewSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    role:{
        type:String,
        required:true
    },
    experience:{
        type:String,
        required:true
    },
    mode:{
        type:String,
        enum:["HR" ,"Technical", "GD"],
        required:true
    },
    interviewType: {
        type: String,
        enum: ["mock", "test"],
        default: "mock"
    },
    cheatingLogs: [{
        timestamp: { type: Date, default: Date.now },
        eventType: String, // e.g., 'tab_switch', 'multiple_faces', 'noise_detected'
        details: String
    }],
    codingPerformance: {
        score: { type: Number, default: 0 },
        feedback: String
    },
    emotionAnalytics: {
        averageConfidence: { type: Number, default: 0 },
        dominantEmotion: String
    },
    resumeText:{
     type:String
    },
    questions:[questionsSchema],

    finalScore: { type: Number, default: 0 },
    overallStrengths: [String],
    overallWeaknesses: [String],
    recommendations: [String],
    readinessLevel: {
      type: String,
      enum: ["Not Ready", "Needs Work", "Almost Ready", "Interview Ready"],
      default: "Not Ready"
    },

    status: {
      type: String,
      enum: ["Incompleted", "completed"],
      default: "Incompleted",
    }
},{timestamps:true})

const Interview = mongoose.model("Interview" , interviewSchema)


export default Interview