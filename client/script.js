let chart;
let workoutsData = [];

const exercisesByBodyPart = {
    Chest: ["Bench Press", "Incline Bench", "Chest Fly"],
    Back: ["Pull-Up", "Deadlift", "Bent Over Row"],
    Legs: ["Squat", "Leg Press", "Lunge"],
    Shoulders: ["Overhead Press", "Lateral Raise", "Front Raise"],
    Arms: ["Bicep Curl", "Tricep Extension", "Hammer Curl"],
    Core: ["Plank", "Crunch", "Leg Raise"]
};

document.getElementById("bodyPart").addEventListener("change", e => populateExercises(e.target.value, "exercise"));
document.getElementById("filterBodyPart").addEventListener("change", e => populateExercises(e.target.value, "filterExercise"));

function populateExercises(bodyPart, selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select Exercise</option>';
    if (exercisesByBodyPart[bodyPart]) {
        exercisesByBodyPart[bodyPart].forEach(ex => {
            const opt = document.createElement("option");
            opt.value = ex;
            opt.textContent = ex;
            select.appendChild(opt);
        });
    }
}

async function addWorkout() {
    const bodyPart = document.getElementById("bodyPart").value;
    let exercise = document.getElementById("exercise").value;
    const customExercise = document.getElementById("customExercise").value.trim();
    if(customExercise) exercise = customExercise;

    const sets = document.getElementById("sets").value;
    const reps = document.getElementById("reps").value;
    const weight = document.getElementById("weight").value;
    const notes = document.getElementById("notes").value;
    let date = document.getElementById("date").value;
    if(!date) date = new Date().toISOString().split("T")[0]; // default today

    if(!bodyPart || !exercise || !sets || !reps || !weight || !date) {
        alert("Please fill all required fields");
        return;
    }

    if(customExercise && !exercisesByBodyPart[bodyPart].includes(customExercise)){
        exercisesByBodyPart[bodyPart].push(customExercise);
        populateExercises(bodyPart, "exercise");
    }

    const workout = {
        bodyPart,
        exercise,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
        notes,
        date
    };

    await fetch("http://localhost:5000/workouts", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(workout)
    });

    clearInputs();
    loadWorkouts();
}

function clearInputs(){
    ["bodyPart","exercise","customExercise","sets","reps","weight","notes","date"].forEach(id=>document.getElementById(id).value="");
}

async function loadWorkouts(){
    const res = await fetch("http://localhost:5000/workouts");
    workoutsData = await res.json();
    workoutsData.sort((a,b)=>new Date(a.date)-new Date(b.date));
    renderWorkoutList(workoutsData);
    renderMainChart(workoutsData);
}

function renderMainChart(workouts){
    const exercises = [...new Set(workouts.map(w=>w.exercise))];
    const labels = [...new Set(workouts.map(w=>w.date))].sort((a,b)=>new Date(a)-new Date(b));

    const datasets = exercises.map(ex=>{
        const data = labels.map(date=>{
            const w = workouts.find(wk=>wk.exercise===ex && wk.date===date);
            return w?w.weight:null;
        });
        return {label:ex, data, borderColor:getRandomColor(), fill:false, tension:0.2};
    });

    if(chart) chart.destroy();
    chart = new Chart(document.getElementById("mainChart"),{
        type:"line",
        data:{labels, datasets},
        options:{responsive:true, plugins:{legend:{position:'bottom'}}}
    });
}

function renderWorkoutList(workouts){
    const listDiv = document.getElementById("workout-list");
    listDiv.innerHTML = "";
    workouts.forEach((w,i)=>{
        const div = document.createElement("div");
        div.className="workout-item";
        div.innerHTML=`
            <strong>${w.date} - ${w.bodyPart} - ${w.exercise}</strong><br>
            ${w.sets} sets x ${w.reps} reps @ ${w.weight} lbs<br>
            Notes: ${w.notes || "-"}<br>
            <button onclick="editWorkout(${i})">Edit</button>
            <button onclick="deleteWorkout(${i})">Delete</button>
        `;
        listDiv.appendChild(div);
    });
}

async function deleteWorkout(index){
    await fetch(`http://localhost:5000/workouts/${index}`, {method:"DELETE"});
    loadWorkouts();
}

function editWorkout(index){
    const w = workoutsData[index];
    document.getElementById("bodyPart").value=w.bodyPart;
    populateExercises(w.bodyPart,"exercise");
    document.getElementById("exercise").value=w.exercise;
    document.getElementById("sets").value=w.sets;
    document.getElementById("reps").value=w.reps;
    document.getElementById("weight").value=w.weight;
    document.getElementById("notes").value=w.notes;
    document.getElementById("date").value=w.date;
    deleteWorkout(index);
}

function applyFilters(){
    const bodyPart=document.getElementById("filterBodyPart").value;
    const exercise=document.getElementById("filterExercise").value;
    let filtered=[...workoutsData];
    if(bodyPart) filtered=filtered.filter(w=>w.bodyPart===bodyPart);
    if(exercise) filtered=filtered.filter(w=>w.exercise===exercise);
    renderWorkoutList(filtered);
    renderMainChart(filtered);
}

function clearFilters(){
    document.getElementById("filterBodyPart").value="";
    document.getElementById("filterExercise").value="";
    renderWorkoutList(workoutsData);
    renderMainChart(workoutsData);
}

function getRandomColor(){
    const letters="0123456789ABCDEF";
    let color="#";
    for(let i=0;i<6;i++) color+=letters[Math.floor(Math.random()*16)];
    return color;
}

loadWorkouts();
