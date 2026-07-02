import {app} from "./app"; 
import connectDB from "./utlis/db";
require ("dotenv").config();


//create server 
app.listen(process.env.PORT, () =>{
    console.log(`server is connected with port ${process.env.PORT}`);
    connectDB();
});



