import mongoose from "mongoose";
export async function conn(){
    await mongoose.connect("mongodb://localhost:27017/RoadBound")
    .then(()=>{
        console.log("Database connected successfully");
    })
    .catch((err)=>{
        console.log(err);
    })
}
