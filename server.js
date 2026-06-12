require("dotenv").config();
require("dns").setDefaultResultOrder("ipv4first");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

/* ========================= */
/* MONGODB CONNECTION */
/* ========================= */

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Connected to MongoDB Atlas ✅");
})
.catch((err)=>{
    console.log(err);
});

/* ========================= */
/* USER SCHEMA */
/* ========================= */

const userSchema =
new mongoose.Schema({

    name:String,

    email:{
        type:String,
        unique:true
    },

    password:String

});

const User =
mongoose.model(
"User",
userSchema
);

/* ========================= */
/* TASK SCHEMA */
/* ========================= */

const taskSchema =
new mongoose.Schema({

    text:String,

    completed:{
        type:Boolean,
        default:false
    }

});

const Task =
mongoose.model(
"Task",
taskSchema
);

/* ========================= */
/* CHAT SCHEMA */
/* ========================= */

const chatSchema = new mongoose.Schema({

    userMessage:String,
    aiReply:String,

    createdAt:{
        type:Date,
        default:Date.now
    }

});

const Chat = mongoose.model(
"Chat",
chatSchema
);

/* ========================= */
/* NOTES SCHEMA */
/* ========================= */

const notesSchema = new mongoose.Schema({

    topic:String,
    notes:String,

    createdAt:{
        type:Date,
        default:Date.now
    }

});

const Note = mongoose.model(
"Note",
notesSchema
);

/* ========================= */
/* PROGRESS SCHEMA */
/* ========================= */

const progressSchema =
new mongoose.Schema({

    totalTasks:Number,
    completedTasks:Number,
    progress:Number

});

const Progress =
mongoose.model(
"Progress",
progressSchema
);

/* ========================= */
/* TIMER SCHEMA */
/* ========================= */

const timerSchema =
new mongoose.Schema({

    focusMinutes:Number,

    date:{
        type:Date,
        default:Date.now
    }

});

const Timer =
mongoose.model(
"Timer",
timerSchema
);

/* ========================= */
/* PROGRESS HISTORY SCHEMA */
/* ========================= */

const ProgressHistorySchema = new mongoose.Schema({

    date:String,

    totalTasks:Number,

    completedTasks:Number,

    progress:Number,

});

const ProgressHistory =
mongoose.model(
"ProgressHistory",
ProgressHistorySchema
);

/* ========================= */
/* SCHEDULE SCHEMA */
/* ========================= */

const scheduleSchema =
new mongoose.Schema({

    subject:String,

    examDate:String,

    dailyHours:Number,

    schedule:String,

    createdAt:{
        type:Date,
        default:Date.now
    }

});

const Schedule =
mongoose.model(
"Schedule",
scheduleSchema
);

/* ========================= */
/* API KEY */
/* ========================= */

const API_KEY =
process.env.GEMINI_API_KEY;


/* ========================= */
/* HOME */
/* ========================= */

app.get("/",(req,res)=>{

    res.send(
    "StudyBot AI Backend Running 🚀"
    );

});

/* ========================= */
/* GET TASKS */
/* ========================= */

app.get("/tasks",

async(req,res)=>{

    try{

        const tasks =
        await Task.find();

        res.json(tasks);

    }

    catch(error){

        res.status(500).send(error);

    }

});

/* ========================= */
/* ADD TASK */
/* ========================= */

app.post("/tasks",

async(req,res)=>{

    try{

        const newTask =
        new Task({

            text:req.body.text

        });

        await newTask.save();

        res.json(newTask);

    }

    catch(error){

        res.status(500).send(error);

    }

});

/* ========================= */
/* DELETE TASK */
/* ========================= */

app.delete("/tasks/:id",

async(req,res)=>{

    try{
    
        await Task.findByIdAndDelete(
        req.params.id
        );

        res.send("Deleted");

    }

    catch(error){

        res.status(500).send(error);

    }

});

app.put("/tasks/:id", async(req,res)=>{

   try{

      const task =
      await Task.findByIdAndUpdate(

         req.params.id,

         {
            completed:req.body.completed
         },

         {new:true}

      );

      res.json(task);

   }

   catch(error){

      res.status(500).send(error);

   }

});


/* ========================= */
/* SIGNUP */
/* ========================= */

app.post("/signup",

async(req,res)=>{

    try{

        const {
            name,
            email,
            password
        } = req.body;

        const existingUser =
        await User.findOne({
            email
        });

        if(existingUser){

            return res.json({

                success:false,
                message:"User already exists"

            });

        }

        const newUser =
        new User({

            name,
            email,
            password

        });

        await newUser.save();

        res.json({

            success:true,
            message:"Account Created"

        });

    }

    catch(error){

        console.log(error);

        res.json({

            success:false,
            message:"Signup Error"

        });

    }

});

/* ========================= */
/* LOGIN */
/* ========================= */

app.post("/login",

async(req,res)=>{

    try{

        const {
            email,
            password
        } = req.body;

        const user =
        await User.findOne({

            email,
            password

        });

        if(user){

            res.json({

                success:true,
                name:user.name

            });

        }

        else{

            res.json({

                success:false,
                message:"Invalid Login"

            });

        }

    }

    catch(error){

        console.log(error);

        res.json({

            success:false
        });

    }

});

/* ========================= */
/* SAVE PROGRESS */
/* ========================= */

app.post("/progress",

async(req,res)=>{

    const progress =
    new Progress({

        totalTasks:req.body.totalTasks,

        completedTasks:req.body.completedTasks,

        progress:req.body.progress

    });

    await progress.save();

    res.json({
        success:true
    });

});

/* ========================= */
/* SAVE TIMER */
/* ========================= */

app.post("/timer", async(req,res)=>{

    if(req.body.minutes <= 0){
        return res.json({success:false});
    }

    const timer = new Timer({
        focusMinutes:req.body.minutes
    });

    await timer.save();

    res.json({success:true});
});

app.post("/daily-progress",

async(req,res)=>{

    await ProgressHistory.findOneAndUpdate(

        {
            date:req.body.date
        },

        {

            totalTasks:req.body.totalTasks,

            completedTasks:req.body.completedTasks,

            progress:req.body.progress,

        },

        {

            upsert:true,

            new:true

        }

    );

    res.json({

        success:true

    });

});

app.get("/daily-progress",

async(req,res)=>{

    const data =
    await ProgressHistory.find()
    .sort({ _id:-1 });

    res.json(data);

});

/* ========================= */
/* AI STUDY PLAN */
/* ========================= */

app.post("/study-plan",

async(req,res)=>{

    try{

        const userPrompt =
        req.body.prompt;

        let finalPrompt = "";

        if(

            userPrompt.toLowerCase()
            .includes("roadmap")

            ||

            userPrompt.toLowerCase()
            .includes("plan")

            ||

            userPrompt.toLowerCase()
            .includes("learn")

        ){

            finalPrompt = `

Create a study roadmap for:
${userPrompt}

Give:
- Daily plan
- Topics
- Practice tasks
- Motivation

`;

        }

        else{

            finalPrompt =
            userPrompt;

        }

        const response =
        await axios.post(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,

{
    contents:[
        {
            parts:[
                {
                    text:finalPrompt
                }
            ]
        }
    ]
}

);

        const aiReply =
        response.data.candidates[0]
        .content.parts[0].text;

        await Chat.create({

    userMessage:userPrompt,

    aiReply:aiReply

});

        res.json({

            reply:aiReply

        });

    }

    catch(error){

        console.log(
        error.response?.data || error
        );

        res.json({

            reply:
            "⚠ AI Error"

        });

    }

});


/* ========================= */
/* AI NOTES */
/* ========================= */

app.post("/notes",

async(req,res)=>{

    try{

        const userPrompt =
        req.body.prompt;

        const finalPrompt = `

Create beautiful study notes on:
${userPrompt}

Include:
- Easy explanation
- Important points
- Examples
- Short summary

`;

        const response =
        await axios.post(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,

{
    contents:[
        {
            parts:[
                {
                    text:finalPrompt
                }
            ]
        }
    ]
}

);

        const aiReply =
        response.data.candidates[0]
        .content.parts[0].text;

    await Note.create({
    topic:userPrompt,
    notes:aiReply
    });

    console.log("Notes saved to DB",userPrompt);

        res.json({

            reply:aiReply

        });

    }

    catch(error){

        console.log(
        error.response?.data || error
        );

        res.json({

            reply:
            "⚠ AI busy right now. Try again."

        });

    }

});

/* ========================= */
/* AI CHAT */
/* ========================= */

app.post("/chat",

async(req,res)=>{

    try{

        const userMessage =
        req.body.message;

        const response =
        await axios.post(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,

{
    contents:[
        {
            parts:[
                {
                    text:userMessage
                }
            ]
        }
    ]
}

);

        const aiReply =
        response.data.candidates[0]
        .content.parts[0].text;

     await Chat.create({
    userMessage:userMessage,
    aiReply:aiReply
    });

        res.json({

            reply:aiReply

        });

    }

    catch(error){

        console.log(
        error.response?.data || error
        );

        res.json({

            reply:"AI Error"

        });

    }

});

/* ========================= */
/* SCHEDULE */
/* ========================= */

app.post("/generate-schedule", async (req, res) => {

    try {

        const { subject, examDate, dailyHours } = req.body;

        const today =
        new Date().toISOString().split("T")[0];

       const prompt = `
Create a study schedule for ${subject} exam.

Today's Date: ${new Date().toISOString().split("T")[0]}
Exam Date: ${examDate}
Daily Study Hours: ${dailyHours}

Rules:
1. Keep the response short and concise.
2. Do NOT give explanations or motivational paragraphs.
3. Return the schedule in HTML format.
4. Use only <h2>, <ul>, and <li> tags.
5. Divide the plan according to ${dailyHours} study hours.
6. If the exam is tomorrow, create only a 1-day revision plan.
7. If more than 1 day remains, create a day-wise schedule until the exam date.
8. Maximum 5 study sessions per day.
9. Only show the study timetable.

Example Format:
<h2>Day 1</h2>
<ul>
<li>09:00 - 10:00 : Topic 1</li>
<li>10:00 - 11:00 : Topic 2</li>
</ul>
`;
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            }
        );

        const reply =
        response.data.candidates[0]
        .content.parts[0].text;

        await Schedule.create({
            subject,
            examDate,
            dailyHours,
            schedule: reply
        });

        res.json({
            reply: reply
        });

    }

    catch(error){

        console.log(error);

        res.status(500).json({
            reply: "Error generating schedule"
        });

    }

});
/* ========================= */
/* SERVER */
/* ========================= */


const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{

console.log(
`Server running on port ${PORT} 🚀`
);
});
