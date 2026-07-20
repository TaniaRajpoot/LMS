import { NextFunction, Response } from "express";
import CourseModel from "../models/course.model";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { redis } from "../utlis/redis";

//create course 
export const createCourse = CatchAsyncError(async(data:any,res:Response,next:NextFunction) =>{
    const course = await CourseModel.create(data);
    await redis.del("all-courses");
    res.status(201).json({
        success:true,
        course
    });  
})


//get all courses 
export const getAllCoursesService = async (res: Response) => {
    const courses = await CourseModel.find().sort({create:-1});
    res.status(201).json({
        success: true,
        courses,
    })
}
