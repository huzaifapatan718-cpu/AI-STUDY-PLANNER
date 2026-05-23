const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const mysql = require("mysql2");

const db = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "8696",
    database: "studybot"

});

db.connect((err)=>{

    if(err){

        console.log(err);

    }

    else{

        console.log("MySQL Connected");

    }

});

/* ========================= */
/* API KEY */
/* ========================= */

const API_KEY =
"AIzaSyA6j2BF-hoKZEFwdxFSGGFSM2hV6L0PkI0";

app.get("/tasks",(req,res)=>{

    db.query(
    "SELECT * FROM tasks",
    (err,result)=>{

        if(err){

            res.status(500).send(err);

        }

        else{

            res.json(result);

        }

    });

});

/* ========================= */
/* HOME */
/* ========================= */

app.get("/",(req,res)=>{

    res.send(
    "StudyBot AI Backend Running 🚀"
    );

});

/* ========================= */
/* TEST AI */
/* ========================= */

app.get("/test-ai",

async(req,res)=>{

    try{

        const response =
        await axios.post(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,

{
    contents:[
        {
            parts:[
                {
                    text:"Hello"
                }
            ]
        }
    ]
}

);

        const aiReply =
        response.data.candidates[0]
        .content.parts[0].text;

        res.json({

            success:true,
            reply:aiReply

        });

    }

    catch(error){

        console.log(
        error.response?.data || error
        );

        res.json({

            success:false,
            error:"AI Error"

        });

    }

});
app.get("/tasks",(req,res)=>{

    db.query(
    "SELECT * FROM tasks",
    (err,result)=>{

        if(err){

            res.status(500).send(err);

        }

        else{

            res.json(result);

        }

    });

});

app.post("/tasks",(req,res)=>{

    const { text } = req.body;

    db.query(

        "INSERT INTO tasks(text) VALUES(?)",

        [text],

        (err,result)=>{

            if(err){

                res.status(500).send(err);

            }

            else{

                res.json({

                    id: result.insertId,
                    text

                });

            }

        }

    );

});
app.delete("/tasks/:id",(req,res)=>{

    db.query(

        "DELETE FROM tasks WHERE id=?",

        [req.params.id],

        (err)=>{

            if(err){

                res.status(500).send(err);

            }

            else{

                res.send("Deleted");

            }

        }

    );

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
/* SERVER */
/* ========================= */

app.listen(3000,()=>{

    console.log(
    "Server running on port 3000 🚀"
    );

});