import express from "express";
import { getNotifications, updateNotification } from "../controllers/notification.controller";
import { isAuthenticated,authorizeRoles } from "../middleware/auth";
const notificationRoute = express.Router();

notificationRoute.get("/get-all-notifications",isAuthenticated,authorizeRoles("admin"),getNotifications);

notificationRoute.put("/update-notifications/:id",isAuthenticated,authorizeRoles("admin"),updateNotification);

export default notificationRoute;