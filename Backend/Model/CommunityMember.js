import mongoose from "mongoose";
const communityMemberSchema=new mongoose.Schema({
    communityId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"community"
    },
    riderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"rider"
    },
    riderPosition:String,
})
const communityMemberModel=mongoose.model("communitymember",communityMemberSchema);
export default communityMemberModel;