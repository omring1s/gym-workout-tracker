let chart;

async function addWorkout(){

const exercise = document.getElementById("exercise").value;
const weight = document.getElementById("weight").value;
const reps = document.getElementById("reps").value;

const workout = {
exercise,
weight: Number(weight),
reps: Number(reps),
date: new Date().toLocaleDateString()
};

await fetch("http://localhost:5000/workouts",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(workout)
});

loadWorkouts();

}

async function loadWorkouts(){

const res = await fetch("http://localhost:5000/workouts");
const workouts = await res.json();

const labels = workouts.map(w => w.date);
const weights = workouts.map(w => w.weight);

const data = {
labels: labels,
datasets: [{
label: "Weight Progress",
data: weights
}]
};

if(chart){
chart.destroy();
}

chart = new Chart(document.getElementById("chart"),{
type:"line",
data:data
});

}

loadWorkouts();
