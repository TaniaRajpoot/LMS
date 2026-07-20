import express from "express";
import { getCoursesAnalytics, getOrdersAnalytics, getUserAnalytics } from "../controllers/analytics.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const analyticRouter = express.Router();

analyticRouter.get("/get-user-analytics",isAuthenticated,authorizeRoles("admin"),getUserAnalytics);
analyticRouter.get("/get-courses-analytics",isAuthenticated,authorizeRoles("admin"),getCoursesAnalytics);
analyticRouter.get("/get-orders-analytics",isAuthenticated,authorizeRoles("admin"),getOrdersAnalytics);


export default analyticRouter; 