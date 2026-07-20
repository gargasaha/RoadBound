import express from 'express'
import {conn} from './Database/db.js';
import router from './Routes/Routes.js';
import {Server} from "socket.io";
import http from 'http';
import cors from 'cors';
const app=express();
const server=http.createServer(app);
const io=new Server(server);
io.on("connection",(Socket)=>{
    // console.log(Socket.id);
})

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());
await conn();
app.use("/",router);
server.listen(3000,()=>{
    console.log("Server is running in port 3000")
});