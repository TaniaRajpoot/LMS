import { NextFunction, Response, Request } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utlis/ErrorHandler";
import OrderModel, { IOrder } from "../models/order.model";
import userModel from "../models/user.models";
import CourseModel from "../models/course.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utlis/sendMail";
import NotificationModel from "../models/notification.model";
import { getAllOrdersService, newOrder } from "../services/order.service";

//create order
export const createOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, payment_info } = req.body as IOrder;
        const user = await userModel.findById(req.user?._id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        const isCourseExist = user?.courses?.some((course: any) => course.courseId === courseId);
        if (isCourseExist) {
            return next(new ErrorHandler("You have already purchased this course", 400));
        }

        const course = await CourseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        const data: any = {
            courseId: course._id.toString(),
            userId: user?._id.toString(),
        };


        // Add course to user's purchased courses
        user.courses.push({ courseId: course._id.toString() });
        await user.save();

        // Increment course purchase count
        if (course.purchased !== undefined) {
            course.purchased += 1;
        } else {
            course.purchased = 1;
        }
        await course.save();

        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            }
        };
        const html = await ejs.renderFile(path.join(__dirname, '../mails/order-confirmation.ejs'), { order: mailData });

        try {
            await sendMail({
                email: user.email,
                subject: "Order Confirmation",
                template: "order-confirmation.ejs",
                data: mailData,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }

        await NotificationModel.create({
            userId: user._id.toString(),
            title: "New Order",
            message: `You have a new order from ${course?.name}`,
        });

        newOrder(data, res, next);



    } catch (error: any) {
        return next(new ErrorHandler(error.message, 404))
    }
});


//get all orders -- for admin 
export const getAllOrders = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllOrdersService(res);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})