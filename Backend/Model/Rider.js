import mongoose from "mongoose";
const riderSchema=new mongoose.Schema({
    riderName:String,
    riderPassword:String,
    riderEmail:String,
    riderPhone:String,
    riderAge:String,
    riderGender:String,
    riderNationality:String,
    profileImage:String
});
const riderModel=mongoose.model("Rider",riderSchema);
export default riderModel;