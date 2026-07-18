import mongoose from "mongoose";
const rideSchema=new mongoose.Schema({
    rideCommunityId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"community"
    },
    rideStartTime:String,
    rideEndTime:String,
    rideStartLat:String,
    rideStartLon:String,
    rideEndLat:String,
    rideEndLon:String,
    tripName:String
})
const rideModel=mongoose.model("ride",rideSchema);
export default rideModel;