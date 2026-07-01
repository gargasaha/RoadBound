import mongoose from "mongoose";
const rideSchema=new mongoose.Schema({
    rideStartTime:String,
    rideEndTime:String,
    rideStartLat:String,
    rideEndLon:String,
    tripName:String
})
const rideModel=mongoose.model("ride",rideSchema);
export default rideModel;