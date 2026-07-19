import userModel from "../models/user.models"
import ErrorHandler from "../utlis/ErrorHandler";
import { redis } from "../utlis/redis"
import { NextFunction, Response } from "express";

///get user by id 

export const getUserById = async (id: string, res: Response) => {
    const userJson = await redis.get(id);

    if (userJson) {
        const user = JSON.parse(userJson);

        res.status(201).json({
            success: true,
            user,
        })
    }
}

//get all users
export const getAllUsersService = async (res: Response) => {
    const users = await userModel.find().sort({create:-1});
    res.status(201).json({
        success: true,
        users,
    })
}


//update user role
export const updateUserRoleService = async (res: Response,id:string,role:string,next:NextFunction) => {
    const user = await userModel.findByIdAndUpdate(id,{role},{new:true});
        
    res.status(200).json({
        success:true,
        user,
    })
}