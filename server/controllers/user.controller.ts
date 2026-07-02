require('dotenv').config();
import { Request,Response,NextFunction } from "express";
import userModel from "../models/user.models";
import ErrorHandler from "../utlis/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import jwt, { Secret }  from "jsonwebtoken";
import ejs from "ejs"
import path from "path";
import sendMail from "../utlis/sendMail";


//register user 
interface IRegisteredBody{
    name:string;
    email:string;
    password:string;
    avatar?:string;


}

export const registrationUser = CatchAsyncError(async(req:Request,res:Response,next:NextFunction) =>{
    try {

        const {name,email,password}= req.body;

        const isEmailExist = await userModel.findOne({email});
        if (isEmailExist) {
            return next(new ErrorHandler("email already exist", 400))
        }

        const user:IRegisteredBody = {
            name,
            email,
            password,
        }

        const activationToken = createActivationTOken(user);
        const activationCode = activationToken.activationCode;

        const data = {user:{name:user.name},activationCode}
        const html = await ejs.renderFile(path.join(__dirname,"../mails/activation-mail.ejs"),data);

        try {
            await sendMail({
                email:user.email,
                subject:"Activate your account ",
                template:"activation-mail.ejs",
                data,
            })

            res.status(201).json({
                success:true,
                message:`Please check your email:${user.email} to activate your account `,
                activationToken:activationToken.token
            })
        } catch (error) {
            
        }
        
    } catch (error:any) {
        return next(new ErrorHandler(error.mesage,400))
    }
});

interface IActivationToken{
    token:string,
    activationCode:string;
}

export const createActivationTOken = (user:any):IActivationToken=>{
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign({
    user,activationCode
    }, process.env.ACTIVATION_SECRET as Secret,{
        expiresIn:"5m",
    });

    return {token,activationCode}
}