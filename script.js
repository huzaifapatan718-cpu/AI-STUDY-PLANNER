let studiedMinutes = 48;
let dailyGoal = 480;

/* ========================= */
/* SECTION NAVIGATION */
/* ========================= */

function showSection(sectionId, element){

    document.querySelectorAll(".section")
    .forEach(section => {

        section.classList.add("hidden");

    });

    document.getElementById(sectionId)
    .classList.remove("hidden");

    document.querySelectorAll(".item")
    .forEach(item => {

        item.classList.remove("active");

    });

    if(element){

        element.classList.add("active");

    }

}

/* ========================= */
/* TASK SYSTEM */
/* ========================= */

const taskInput =
document.getElementById("taskInput");

const addTaskBtn =
document.getElementById("addTaskBtn");

const taskList =
document.getElementById("taskList");

async function loadTasks(){

    try{

        taskList.innerHTML = "";

        const response =
        await fetch(
        "http://localhost:3000/tasks"
        );

        const tasks =
        await response.json();

        tasks.forEach(task => {

            createTask(task);

        });

    }

    catch(error){

        console.log(error);

    }

}

function createTask(task){

    const taskDiv =
    document.createElement("div");

    taskDiv.classList.add("task");

    taskDiv.innerHTML = `

    <input type="checkbox"
    onchange="toggleTask(this)">

    <span class="task-text">
    ${task.text}
    </span>

    <button class="delete-btn"
    onclick="deleteTask('${task.id}')">
    ✖
    </button>

    `;

    taskList.appendChild(taskDiv);

    updateAnalytics();

}

function toggleTask(checkbox){

    const taskDiv =
    checkbox.parentElement;

    taskDiv.classList.toggle("completed");

    updateAnalytics();

}

async function deleteTask(id){

    try{

        await fetch(
        `http://localhost:3000/tasks/${id}`,
        {
            method:"DELETE"
        }
        );

        loadTasks();

    }

    catch(error){

        console.log(error);

    }

}

/* ========================= */
/* ADD TASK */
/* ========================= */

if(addTaskBtn){

    addTaskBtn.onclick =
    async function(){

        const text =
        taskInput.value.trim();

        if(text === ""){
            return;
        }

        try{

            const response =
            await fetch(
            "http://localhost:3000/tasks",
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({
                    text:text
                })

            }

            );

            const newTask =
            await response.json();

            createTask(newTask);

            taskInput.value = "";

        }

        catch(error){

            console.log(error);

        }

    };

}

loadTasks();

/* ========================= */
/* AI STUDY PLAN */
/* ========================= */

async function generatePlan(){

    const prompt =
    document.getElementById("aiPrompt").value;

    const aiResult =
    document.getElementById("aiResult");

    if(prompt.trim() === ""){

        aiResult.innerHTML =
        "Enter something";

        return;

    }

    aiResult.innerHTML =
    "Thinking...";

    try{

        const response =
        await fetch(
        "http://localhost:3000/study-plan",
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                prompt:prompt
            })

        });

        const data =
        await response.json();

        aiResult.innerHTML = `
        <div class="bot-message">
            ${data.reply}
        </div>
        `;

        if(isVoiceMode){

            speakText(data.reply);

            isVoiceMode = false;

        }

    }

    catch(error){

        console.log(error);

        aiResult.innerHTML =
        "⚠ AI Error";

    }

}

/* ========================= */
/* NOTES */
/* ========================= */

async function generateNotes(){

    const prompt =
    document.getElementById("notesPrompt").value;

    const resultBox =
    document.getElementById("notesResult");

    if(prompt === ""){

        resultBox.innerHTML =
        "Enter topic";

        return;

    }

    resultBox.innerHTML =
    "Generating Notes...";

    try{

        const response =
        await fetch(
        "http://localhost:3000/notes",
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                prompt:prompt
            })

        });

        const data =
        await response.json();

        resultBox.innerHTML = `
        <div class="bot-message">
            ${data.reply}
        </div>
        `;

    }

    catch(error){

        resultBox.innerHTML =
        "Server Error";

        console.log(error);

    }

}

/* ========================= */
/* DOUBT SOLVER */
/* ========================= */

async function solveDoubt(){

    const prompt =
    document.getElementById("doubtPrompt").value;

    const resultBox =
    document.getElementById("doubtResult");

    if(prompt === ""){

        alert("Enter your doubt");

        return;

    }

    resultBox.innerHTML =
    "Thinking...";

    try{

        const response =
        await fetch(
        "http://localhost:3000/study-plan",
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                prompt: `
Solve this study doubt in simple language:

${prompt}
`
            })

        });

        const data =
        await response.json();

        resultBox.innerHTML = `
        <div class="bot-message">
            ${data.reply}
        </div>
        `;

    }

    catch(error){

        resultBox.innerHTML =
        "Error solving doubt";

    }

}

/* ========================= */
/* POMODORO TIMER */
/* ========================= */

let timer;

let timeLeft = 25 * 60;

let isBreak = false;

const timerText =
document.getElementById("timerText");

const timerStatus =
document.getElementById("timerStatus");

function updateTimer(){

    if(!timerText) return;

    let minutes =
    Math.floor(timeLeft / 60);

    let seconds =
    timeLeft % 60;

    seconds =
    seconds < 10 ? "0" + seconds : seconds;

    timerText.innerHTML =
    `${minutes}:${seconds}`;

}

updateTimer();

const startBtn =
document.getElementById("startBtn");

if(startBtn){

    startBtn.addEventListener("click", ()=>{

        clearInterval(timer);

        timer = setInterval(()=>{

            timeLeft--;

            updateTimer();

            if(timeLeft <= 0){

                studiedMinutes += 25;
                updateAttendance();

                clearInterval(timer);

                if(!isBreak){

                    isBreak = true;

                    timerStatus.innerHTML =
                    "Break Time ☕";

                    timeLeft = 5 * 60;

                    alert(
                    "Focus session complete!"
                    );

                }

                else{

                    isBreak = false;

                    timerStatus.innerHTML =
                    "Focus Session";

                    timeLeft = 25 * 60;

                    alert(
                    "Break finished!"
                    );

                }

                updateTimer();

            }

        },1000);

    });

}

const pauseBtn =
document.getElementById("pauseBtn");

if(pauseBtn){

    pauseBtn.addEventListener("click", ()=>{

        clearInterval(timer);

    });

}

const resetBtn =
document.getElementById("resetBtn");

if(resetBtn){

    resetBtn.addEventListener("click", ()=>{

        clearInterval(timer);

        isBreak = false;

        timeLeft = 25 * 60;

        timerStatus.innerHTML =
        "Focus Session";

        updateTimer();

    });

}

/* ========================= */
/* MUSIC */
/* ========================= */

const soundSelect =
document.getElementById("soundSelect");

const ambientAudio =
document.getElementById("ambientAudio");

if(soundSelect){

    soundSelect.addEventListener("change", ()=>{

        ambientAudio.src =
        soundSelect.value;

        ambientAudio.play();

    });

}

/* ========================= */
/* VOICE */
/* ========================= */

let isVoiceMode = false;

function speakText(text){

    window.speechSynthesis.cancel();

    const speech =
    new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 1;

    window.speechSynthesis.speak(speech);

}

function stopVoice(){

    window.speechSynthesis.cancel();

}

const voiceBtn =
document.getElementById("voiceBtn");

if(
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window
){

    const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

    const recognition =
    new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.onresult =
    async function(event){

        isVoiceMode = true;

        const transcript =
        event.results[0][0].transcript;

        document.getElementById("aiPrompt").value =
        transcript;

        await generatePlan();

    };

    if(voiceBtn){

        voiceBtn.addEventListener("click", ()=>{

            recognition.start();

        });

    }

}

/* ========================= */
/* ANALYTICS */
/* ========================= */

function updateAnalytics(){

    const tasks =
    document.querySelectorAll(".task");

    const total =
    tasks.length;

    const completed =
    document.querySelectorAll(
    ".task.completed"
    ).length;

    let progress = 0;

    if(total > 0){

        progress =
        Math.floor(
        (completed / total) * 100
        );

    }

    /* ANALYTICS SECTION */

    document.getElementById(
    "totalTasks"
    ).innerText = total;

    document.getElementById(
    "completedTasks"
    ).innerText = completed;

    document.getElementById(
    "progressPercent"
    ).innerText = progress + "%";

    document.getElementById(
    "progressBar"
    ).style.width =
    progress + "%";

    /* DASHBOARD WEEKLY PROGRESS */

    const weeklyProgress =
    document.getElementById(
    "weeklyProgress"
    );

    if(weeklyProgress){

        weeklyProgress.innerText =
        progress + "%";

    }

}
/* ========================= */
/* ATTENDANCE SYSTEM */
/* ========================= */

function updateAttendance(){

    const percent =
    Math.floor(
    (studiedMinutes / dailyGoal) * 100
    );

    /* STUDIED TIME */

    const studiedTime =
    document.getElementById(
    "studiedTime"
    );

    if(studiedTime){

        studiedTime.innerText =
        studiedMinutes + " min";

    }

    /* PERCENT */

    const attendancePercent =
    document.getElementById(
    "attendancePercent"
    );

    if(attendancePercent){

        attendancePercent.innerText =
        percent + "%";

    }

    /* BAR */

    const attendanceFill =
    document.getElementById(
    "attendanceFill"
    );

    if(attendanceFill){

        attendanceFill.style.width =
        percent + "%";

    }

    /* CIRCLE */

    const circle =
    document.querySelector(
    ".circle-progress"
    );

    if(circle){

        circle.style.background =
        `conic-gradient(
        #66ff66 0% ${percent}%,
        rgba(255,255,255,.08) ${percent}% 100%
        )`;

    }

}

/* INITIAL LOAD */

updateAttendance();
/* ========================= */
/* LOGIN SYSTEM */
/* ========================= */

function loginUser(){

    const username =
    document.getElementById("username").value;

    const password =
    document.getElementById("password").value;

    if(
        username === "huzaifa" &&
        password === "8696"
    ){

        document.getElementById(
        "loginPage"
        ).style.display = "none";

    }

    else{

        alert(
        "Wrong Username or Password"
        );

    }

}