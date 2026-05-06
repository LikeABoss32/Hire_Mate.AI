import express from "express";
import { isAdmin } from "../middlewares/isAdmin.js";
import { getAllCandidates, getAdminDashboardStats, getHiddenReport, adminLogin, deleteInterview } from "../controllers/admin.controller.js";
import isAuth from "../middlewares/isAuth.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);

// All admin routes are protected by isAuth and isAdmin middlewares
adminRouter.use(isAuth, isAdmin);

adminRouter.get("/candidates", getAllCandidates);
adminRouter.get("/stats", getAdminDashboardStats);
adminRouter.get("/report/:id", getHiddenReport);
adminRouter.delete("/interview/:id", deleteInterview);

export default adminRouter;
