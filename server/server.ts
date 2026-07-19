import {app} from "./app"; 
import connectDB from "./utlis/db";
import{ v2 as cloudinary} from "cloudinary"
require ("dotenv").config();

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_SECRET_KEY,
})


//create server 
const port = process.env.PORT || 8000;
app.listen(port, () =>{
    console.log(`server is connected with port ${port}`);
    connectDB();
});



