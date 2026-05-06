import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { startGD, respondGD, finishGD, getMyGDs } from "../controllers/gd.controller.js"

const gdRouter = express.Router()

gdRouter.post("/start", isAuth, startGD)
gdRouter.post("/respond", isAuth, respondGD)
gdRouter.post("/finish", isAuth, finishGD)
gdRouter.get("/my-gds", isAuth, getMyGDs)

export default gdRouter
