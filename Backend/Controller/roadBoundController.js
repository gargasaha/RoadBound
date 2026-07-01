import mongoose from "mongoose";
import riderModel from "../Model/Rider.js";
import communityModel from "../Model/Community.js";
import communitymemberModel from "../Model/CommunityMember.js";
import communityMemberModel from "../Model/CommunityMember.js";
import chatModel from "../Model/Chat.js";
async function saveRider(req, res) {
    let count = '';
    count = await riderModel.countDocuments({ riderEmail: req.body.riderEmail });
    if (count != 0) {
        res.status(200).send({ message: 'Email already exists' });
        return;
    }
    await riderModel.create(req.body)
        .then(() => {
            res.send({ message: "ok" });
        })
}
async function checkRider(req, res) {
    let count = await riderModel.countDocuments(
        { $and: [{ riderEmail: req.body.riderEmail }, { riderPassword: req.body.riderPassword }] })
    if (count > 0) {
        let riderId=await riderModel.findOne({
            riderEmail: req.body.riderEmail,
            riderPassword: req.body.riderPassword
        })
        riderId=riderId._id;
        res.status(200).send({ message: 'Logged in successfully',riderId:riderId });
    }
    else {
        res.status(200).send({ message: 'Wrong email or password' });
    }
}
async function searchCommunityList(req,res){
    const rider = await riderModel.findOne({
        riderEmail: req.params.email
    });

    if (!rider) {
        return res.status(404).json({
            message: "Rider not found"
        });
    }

    const memberships = await communityMemberModel.find({
        riderId: rider._id,
    }).populate("communityId");

    const communities = memberships
        .filter(item => item.communityId && item.communityId.communityName.toLowerCase().includes(req.params.keyword.toLowerCase()))
        .map(item => item.communityId);

    res.json(communities);
}
async function getCommunityList(req, res) {
    const rider = await riderModel.findOne({
        riderEmail: req.params.email
    });

    if (!rider) {
        return res.status(404).json({
            message: "Rider not found"
        });
    }

    const memberships = await communityMemberModel.find({
        riderId: rider._id
    }).populate("communityId");

    const communities = memberships.map(
        item => item.communityId
    );

    res.json(communities);
}
async function saveCommunity(req,res){
    let rider = await riderModel.findOne({ riderEmail: req.body.email });
    if (!rider) {
        return res.status(404).send({ message: 'Rider not found' });
    }
    let riderId = rider._id;
    let community=await communityModel.create(req.body.data);
    let communityId=community._id;
    let data={communityId,riderId,riderPosition:'Admin'};
    await communityMemberModel.create(data);
    res.status(200).send({message:'Community saved'});
}
async function joinCommunity(req,res){
    if (!mongoose.Types.ObjectId.isValid(req.body.communityId)) {
        return res.status(200).send({ message: 'Community does not exists' });
    }

    let c = await communityModel.countDocuments({ _id: req.body.communityId });
    if (c == 0) {
        return res.status(200).send({ message: 'Community does not exists' });
    }

    let rider = await riderModel.findOne({ riderEmail: req.body.riderEmail });
    if (!rider) {
        return res.status(200).send({ message: 'Rider not found' });
    }
    let riderId = rider._id.toString();
    let count=await communityMemberModel.countDocuments({
        riderId:riderId,
        communityId:req.body.communityId
    });
    if(count==0){
        await communityMemberModel.create({
            communityId:req.body.communityId,
            riderId:riderId,
            riderPosition:'Member'
        });
        res.status(200).send({message:'Rider Joined community'});
    }
    else{
        res.status(200).send({message:'Rider already in community'});
    }
}   
async function getCommunity(req,res){
    let data=await communityModel.find({
        _id:req.params.communityId
    });
    res.status(200).send(data);
}
async function saveMessage(req,res){
    await chatModel.create(req.body)
    .then(()=>{
        res.status(200).send({message:'Message saved'})
    })
    .catch((error)=>{
        res.status(500).send({message:error});
    })
}
async function getMessage(req,res){
    const messages = await chatModel.find({
        communityId: req.params.communityId
    }).populate('riderId')
    return res.status(200).send(messages);
}
export default { getMessage,saveMessage,getCommunity,saveRider, checkRider, getCommunityList,saveCommunity,joinCommunity,searchCommunityList }