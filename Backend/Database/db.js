import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
export async function conn(){
    await mongoose.connect(process.env.DataBaseStr)
    .then(()=>{
        console.log("Database connected successfully");
    })
    .catch((err)=>{
        console.log(err);
    })
}
