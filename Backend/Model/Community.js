import mongoose from "mongoose";
const communitySchema=new mongoose.Schema({
    communityName:String,
    communityImage:String,
    communityBio:String
})
const communityModel=mongoose.model("community",communitySchema);
export default communityModel;