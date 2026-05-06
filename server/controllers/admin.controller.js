import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Standard ID and Password
    if (email !== "admin@gmail.com" || password !== "admin123") {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    let admin = await User.findOne({ email: "admin@gmail.com" });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 12);
      admin = await User.create({
        name: "System Admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin"
      });
    }

    const token = await genToken(admin._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
  } catch (error) {
    return res.status(500).json({ message: `Admin login failed: ${error.message}` });
  }
};

export const getAllCandidates = async (req, res) => {
  try {
    const { role, mode, type, readiness } = req.query;
    
    let filter = {};
    if (role) filter.role = new RegExp(role, 'i');
    if (mode) filter.mode = mode;
    if (type) filter.interviewType = type;
    if (readiness) filter.readinessLevel = readiness;

    const interviews = await Interview.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .select("-questions.answer -questions.idealAnswer -questions.detailedFeedback"); // exclude heavy fields for list

    return res.status(200).json(interviews);
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch candidates: ${error.message}` });
  }
};

export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalInterviews = await Interview.countDocuments({ interviewType: "test" });
    
    // Count unique users who have taken a test
    const uniqueCandidates = await Interview.distinct("userId", { interviewType: "test" });
    const totalCandidates = uniqueCandidates.length;
    
    const readinessStats = await Interview.aggregate([
      { $match: { interviewType: "test" } },
      { $group: { _id: "$readinessLevel", count: { $sum: 1 } } }
    ]);

    const averageScoreResult = await Interview.aggregate([
      { $match: { status: "completed", interviewType: "test" } },
      { $group: { _id: null, avgScore: { $avg: "$finalScore" } } }
    ]);
    const averageScore = averageScoreResult.length > 0 ? averageScoreResult[0].avgScore : 0;

    return res.status(200).json({
      totalInterviews,
      totalCandidates,
      averageScore: averageScore.toFixed(1),
      readinessStats
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch stats: ${error.message}` });
  }
};

export const getHiddenReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('userId', 'name email');

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Admins can see everything, regardless of test/mock mode
    return res.status(200).json(interview);
  } catch (error) {
    return res.status(500).json({ message: `Failed to fetch hidden report: ${error.message}` });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    return res.status(200).json({ message: "Interview deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete interview: ${error.message}` });
  }
};
