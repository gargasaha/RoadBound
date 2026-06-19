import express, { Router } from 'express'
import {conn} from './Database/db.js';
import router from './Routes/Routes.js';
import cors from 'cors'
const app=express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(express.json());
await conn();
app.use("/",router);
app.listen(3000,()=>{
    console.log("Server is running in port 3000")
});