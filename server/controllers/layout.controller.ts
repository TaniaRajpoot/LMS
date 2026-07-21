import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utlis/ErrorHandler"
import LayoutModel from "../models/layout.model";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import cloudinary from "cloudinary";

// create layouts
export const createLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        if (type === "Banner") {
            const { image, title, subtitle } = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "layout"
            })

            await LayoutModel.create({
                type: "Banner",
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subtitle
                }
            });
        }

        if (type === "FAQ") {
            const { faq } = req.body;
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    }
                })
            )
            await LayoutModel.create({
                type: "FAQ",
                faq
            });
        }

        if (type === "Categories") {
            const { categories } = req.body;
            const categoriesItems = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title
                    }
                })
            )
            await LayoutModel.create({
                type: "Categories",
                categories
            });
        }

        res.status(200).json({
            success: true,
            message: "Layout created successfully"
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))

    }
})


//edit layout 

export const editLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        if (type === "Banner") {
            const bannerData: any = await LayoutModel.findOne({ type: "Banner" })
            const { image, title, subtitle } = req.body;
            await cloudinary.v2.uploader.destroy(bannerData.banner.image.public_id);

            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "layout",

            })
            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subtitle
            };
            await LayoutModel.findByIdAndUpdate(bannerData._id, { banner });
        }

        if (type === "FAQ") {
            const { faq } = req.body;
            const FaqItem: any = await LayoutModel.findOne({ type: "FAQ" })
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    }
                })
            )
            await LayoutModel.findByIdAndUpdate(FaqItem._id, { faq: faqItems })

        }

        if (type === "Categories") {
            const { categories } = req.body;
            const categoriesData: any = await LayoutModel.findOne({ type: "Categories" })
            const categoriesItems = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title
                    }
                })
            )
            await LayoutModel.findByIdAndUpdate(categoriesData._id, {
                type: "Categories",
                categories: categoriesItems
            })
        }

        res.status(200).json({
            success: true,
            message: "Layout Updated successfully"
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})


//get layout by type 

export const getLayoutByType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        const layout = await LayoutModel.findOne({ type });
        res.status(200).json({
            success: true,
            layout,
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))

    }
})