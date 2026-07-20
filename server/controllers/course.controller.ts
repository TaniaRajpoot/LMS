import { NextFunction, Response, Request } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError"; 
import ErrorHandler from "../utlis/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utlis/redis";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendMail from "../utlis/sendMail";
import NotificationModel from "../models/notification.model";


// upload course 
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;

        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        createCourse(data, res, next);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})


//edit course 
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id as string;

        const courseData = await CourseModel.findById(courseId);
        if (!courseData) {
            return next(new ErrorHandler("Course not found", 404));
        }

        if (thumbnail) {
            if (typeof thumbnail === "string" && thumbnail.startsWith("data:image")) {
                if (courseData.thumbnail?.public_id) {
                    await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id);
                }
                const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                    folder: "courses",
                });
                data.thumbnail = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            } else if (typeof thumbnail === "string") {
                if (courseData.thumbnail && courseData.thumbnail.url === thumbnail) {
                    data.thumbnail = {
                        public_id: courseData.thumbnail.public_id,
                        url: courseData.thumbnail.url
                    };
                }
            } else if (typeof thumbnail === "object" && thumbnail.public_id && thumbnail.url) {
                data.thumbnail = thumbnail;
            }
        }

        const course = await CourseModel.findByIdAndUpdate(courseId, {
            $set: data
        }, { new: true });

        await redis.set(courseId, JSON.stringify(course));
        await redis.del("all-courses");

        res.status(201).json({
            success: true,
            course,
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

//get single course --- without  purchasing 
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const courseId = req.params.id as string;

        const isCacheExists = await redis.get(courseId);
        if (isCacheExists) {
            const course = JSON.parse(isCacheExists);
            return res.status(200).json({
                success: true,
                course,
            });
        } else {

            const course = await CourseModel.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");


            await redis.set(courseId, JSON.stringify(course), "EX", 604800); //7 days 


            res.status(200).json({
                success: true,
                course,
            });
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

//get all course without purchase 
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCacheExists = await redis.get("all-courses")
        if(isCacheExists){
            const courses = JSON.parse(isCacheExists);
            return res.status(200).json({
                success: true,
                courses,
            });
        }else{
        const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        await redis.set("all-courses", JSON.stringify(courses));
        res.status(200).json({
            success: true,
            courses,
        });
        }
        
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

//get course content -- only for valid user 
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
       const userCourseList = req.user?.courses;

       const courseId = req.params.id as string;
       const courseExists = userCourseList?.find((course:any) => course.courseId === courseId);
       
       if(!courseExists && req.user?.role !== "admin"){
           return next(new ErrorHandler("You are not authorized to access this course", 400));
       }
       const course = await CourseModel.findById(courseId);
       const content = course?.courseData;

       res.status(200).json({
           success:true,
           content,
       });
       
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

//add question in course 
interface IAddQuestionData{
    question:string;
    courseId:string;
    contentId:string;

}

export const addQuestion = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const {question ,courseId ,contentId} = req.body as IAddQuestionData;
        
        const course = await CourseModel.findById(courseId);
        
        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler("Invalid Content id", 404));
        }
        const courseContent = course?.courseData?.find((item:any) => item._id.toString() === contentId);

        if(!courseContent){
            return next (new ErrorHandler("invalid content id",400))
        }
        
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: [],
        };

        //add this question to our course content 
        courseContent.questions.push(newQuestion);

        await NotificationModel.create({
                userId: req.user?._id?.toString(),
                title: "New Question",
                message: `You have a new question in ${course?.name}`,
            });
            
        // save the updated course
        await course?.save();

        res.status(200).json({
            success: true,
            course,
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})


//add answer in question of course 
interface IAddAnswerData{
    answer:string;
    courseId:string;
    contentId:string;
    questionId:string;
   
  
}


export const addAnswer = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const {answer ,courseId ,contentId ,questionId} = req.body as IAddAnswerData;
        
        const course = await CourseModel.findById(courseId);
        
        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler("Invalid Content id", 404));
        }
        const courseContent = course?.courseData?.find((item:any) => item._id.toString() === contentId);

        if(!courseContent){
            return next (new ErrorHandler("invalid content id",400))
        }
        const question = courseContent?.questions?.find((item:any) => item._id.equals(questionId));

        if(!question){
            return next (new ErrorHandler("invalid question id",400))
        }
        
        const newAnswer: any = {
            user: req.user,
            answer,
            answerReply: [],
        };

        //add this answer to our course content 
        question.questionReplies.push(newAnswer);

        // save the updated course
        await course?.save();

        if(req.user?._id === question.user._id){
            //create a notification 
            await NotificationModel.create({
                userId: req.user?._id?.toString(),
                title: "New Question Reply",
                message: `You have a new question reply in ${courseContent.title}`,
            });
        }else{
            const data = {
                name:question.user.name,
                title:courseContent.title
            }

            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data,
                });
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 400));
            }
        }

        res.status(200).json({
            success: true,
            course,
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

//add review in course 
interface IAddReviewData{
    review: string;
    rating:number;
    userId:string;
}

export const addReview = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const userCourseList= req.user?.courses;
        const courseId = req.params.id;

        const courseExists = userCourseList?.find((course:any)=> course.courseId === courseId);
        if(!courseExists && req.user?.role !== "admin"){
            return next(new ErrorHandler("You are not authorized to access this course", 400));
        }

        const course = await CourseModel.findById(courseId);
        if(!course){
            return next(new ErrorHandler("Course not found", 404));
        }

        const {review ,rating} = req.body as IAddReviewData
        const reviewData:any = {
            user: req.user,
            comment:review,
            rating,
          
        };
        course?.reviews.push(reviewData);

        let avg = 0;
        course?.reviews.forEach((review:any) => {
            avg += review.rating;
        });
        
        if(course){
            course.ratings = avg / course?.reviews.length;
        }

        await course?.save();

        const notification = {
            title:"New Review Recieved ",
            message:`${req.user?.name} has given a review in ${course?.name}`,
        }

        //create notificattion 

        res.status(200).json({
            success:true,
            course,
        })


    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

//add replies in reviews 
interface IAddReviewData{
    comment :string;
    courseId:string;
    reviewId:string
}

export const addReplyToReview = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {comment,courseId,reviewId} = req.body as IAddReviewData;
        const course = await CourseModel.findById(courseId);

        if(!course){
         return next (new ErrorHandler("course not found ",404));
        }
        const review = course?.reviews?.find((rev:any)=> rev._id.toString() === reviewId);
        if(!review){
            return next (new ErrorHandler("Review not found",404));
        }
        
        const replyData:any = {
            user:req.user,
            comment
        }

        if(!review?.commentReplies){
            review.commentReplies = [];
        }
        review?.commentReplies.push(replyData);

        await course?.save();

        res.status(400).json({
            success:true,
            course
        })
    } catch (error:any) {
        return next (new ErrorHandler(error.message,500))
    }
})


//get all courses for admin 
export const getAllCoursesForAdmin = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        getAllCoursesService(res);
    } catch (error:any) {
        return next (new ErrorHandler(error.message,400 ))
    }
})


//delete all courses -- only for admin 

export const deleteCourse = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const id = req.params.id as string;
        const course = await CourseModel.findByIdAndDelete(id);
        if(!course){ 
            return next(new ErrorHandler("Course not found",400));
        }
        await course.deleteOne({id});
        await redis.del(id);
        await redis.del("all-courses");
        res.status(200).json({
            success:true,
            message:"Course deleted successfully",
        })
    } catch (error:any) {
        return next (new ErrorHandler(error.message,400))
    }
})