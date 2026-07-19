import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { addAnswer, addQuestion, addReview, editCourse, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse,addReplyToReview, getAllCoursesForAdmin, deleteCourse } from "../controllers/course.controller";

const courseRouter = express.Router();

courseRouter.post("/create-course",isAuthenticated,authorizeRoles("admin"),uploadCourse);
courseRouter.put("/edit-course/:id",isAuthenticated,authorizeRoles("admin"),editCourse);
courseRouter.get("/get-course/:id",getSingleCourse);
courseRouter.get("/get-all-courses",getAllCourses);
courseRouter.get("/get-course-content/:id",isAuthenticated,getCourseByUser);
courseRouter.put("/add-question",isAuthenticated,addQuestion);
courseRouter.put("/add-answer",isAuthenticated,addAnswer);
courseRouter.put("/add-review/:id",isAuthenticated,addReview);
courseRouter.put("/add-reply",isAuthenticated,authorizeRoles("admin"),addReplyToReview);
courseRouter.get("/get-all-courses-admin",isAuthenticated,authorizeRoles("admin"),getAllCoursesForAdmin);
courseRouter.delete("/delete-course/:id",isAuthenticated,authorizeRoles("admin"),deleteCourse);
export default courseRouter;