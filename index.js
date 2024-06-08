import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import bodyParser from "body-parser";
import axios from "axios";
import {marked} from "marked";

dotenv.config();
const app=express();
const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
app.use(bodyParser.urlencoded({extended: false}));
const data={data: null}

app.get('/', async (req, res)=>{
    res.render("index.ejs", data);
    data.data=null;
});

app.post('/', async (req, res)=>{
        const temp= await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${req.body.place}&aqi=no`);
        const prompt = `suggest some food recommendation for the place ${req.body.place} where the temperature is ${temp.data.current.temp_c} degree celsius keep it consize with point wise in plain text with location and temperature in heading`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = marked(response.text());
        data.data=text;
        res.redirect('/');
});

app.listen(process.env.PORT, ()=>{
    console.log(`Server running on PORT ${process.env.PORT}`);
});