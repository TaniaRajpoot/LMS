import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utlis/ErrorHandler";
import { generateLast12MonthData } from "../utlis/analytics.generator";
import userModel from "../models/user.models";
import CourseModel from "../models/course.model";
import OrderModel from "../models/order.model"


//get user analytics  -- only for admin 
export const getUserAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await generateLast12MonthData(userModel);

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

//get courses analytics --only for admin 

export const getCoursesAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await generateLast12MonthData(CourseModel);

        res.status(200).json({
            success: true,
            courses,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

//get orders analytics --only for admin 

export const getOrdersAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await generateLast12MonthData(OrderModel);

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})
