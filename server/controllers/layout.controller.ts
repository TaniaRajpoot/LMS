import { Request,Response,NextFunction } from "express";
import ErrorHandler from "../utlis/ErrorHandler"
import LayoutModel from "../models/layout.model";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import cloudinary from "cloudinary";

// Create Layout
export const createLayout = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {type} = req.body;
        
        // Check if layout type already exists
        const isTypeExist = await LayoutModel.findOne({type});
        if(isTypeExist){
            return next(new ErrorHandler(`${type} already exists`, 400));
        }

        if(type === "Banner"){
            const {image,title,subtitle} = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image,{
                folder:"layout"
            });

            await LayoutModel.create({
                type: "Banner",
                banner: {
                    image:{
                        public_id:myCloud.public_id,
                        url:myCloud.secure_url,
                    },
                    title,
                    subtitle
                }
            });
        }

        if(type === "FAQ"){
            const {faq} = req.body;
            const faqItems = await Promise.all(
                faq.map(async(item:any)=>{
                    return {
                        question:item.question,
                        answer:item.answer
                    }
                })
            );
            await LayoutModel.create({
                type: "FAQ",
                faq: faqItems
            });
        }

        if(type === "Categories"){
            const {categories} = req.body;
            const categoriesItems = await Promise.all(
                categories.map(async(item:any)=>{
                    return {
                        title:item.title
                    }
                })
            );
            await LayoutModel.create({
                type: "Categories",
                categories: categoriesItems
            });
        }

        res.status(200).json({
            success: true,
            message: "Layout created successfully"
        });

    }catch(error:any){
        return next (new ErrorHandler(error.message,500))
    }
});

// Edit layout 
export const editLayout = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {type} = req.body;
        
        if(type === "Banner"){
            const bannerData:any = await LayoutModel.findOne({type:"Banner"});
            const {image,title,subtitle} = req.body;
            
            if(bannerData){
                await cloudinary.v2.uploader.destroy(bannerData.banner.image.public_id);
            }
            
            const myCloud = await cloudinary.v2.uploader.upload(image,{
                folder:"layout",
            });
            
            const banner = {
                image:{
                    public_id:myCloud.public_id,
                    url:myCloud.secure_url,
                },
                title,
                subtitle
            };
            
            await LayoutModel.findOneAndUpdate({type: "Banner"}, {type: "Banner", banner}, {new: true, upsert: true});
        }   

        if(type === "FAQ"){
            const {faq} = req.body;
            const faqItems = await Promise.all(
                faq.map(async(item:any)=>{
                    return {
                        question:item.question,
                        answer:item.answer
                    }
                })
            );
            
            await LayoutModel.findOneAndUpdate({type: "FAQ"}, {type: "FAQ", faq: faqItems}, {new: true, upsert: true});
        }

        if(type === "Categories"){
            const {categories} = req.body;
            const categoriesItems = await Promise.all(
                categories.map(async(item:any)=>{
                    return {
                        title:item.title
                    }
                })
            );
            
            await LayoutModel.findOneAndUpdate({type: "Categories"}, {type: "Categories", categories: categoriesItems}, {new: true, upsert: true});
        }

        res.status(200).json({
            success: true,
            message: "Layout Updated successfully"
        });
        
    }catch(error:any){
        return next (new ErrorHandler(error.message,500))
    }
});

// Get layout by type
export const getLayoutByType = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const type = req.body.type || req.query.type || req.params.type;
        const layout = await LayoutModel.findOne({type});
        res.status(200).json({
            success: true,
            layout
        });
    } catch(error:any){
        return next(new ErrorHandler(error.message, 500));
    }
});