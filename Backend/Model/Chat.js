import mongoose from "mongoose";
const chatSchema=new mongoose.Schema({
    communityId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Community"
    },
    riderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Rider"
    },
    messageType:Number,
    message:String,
    
})
const chatModel=mongoose.model("chat",chatSchema);
export default chatModel;