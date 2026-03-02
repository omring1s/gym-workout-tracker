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

// Populate exercises based on body part
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

// Add workout
async function addWorkout() {
    const bodyPart = document.getElementById("bodyPart").value;
    const exercise = document.getElementById("exercise").value;
    const sets = document.getElementById("sets").value;
    const reps = document.getElementById("reps").value;
    const weight = document.getElementById("weight").value;
    const notes = document.getElementById("notes").value;

    if (!bodyPart || !exercise || !sets || !reps || !weight) {
        alert("Please fill all required fields");
        return;
    }

    const workout = {
        bodyPart,
        exercise,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
        notes,
        date: new Date().toLocaleDateString()
    };

    await fetch("http://localhost:5000/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workout)
    });

    clearInputs();
    loadWorkouts();
}

function clearInputs() {
    ["bodyPart","exercise","sets","reps","weight","notes"].forEach(id => document.getElementById(id).value = "");
}

// Load workouts
async function loadWorkouts() {
    const res = await fetch("http://localhost:5000/workouts");
    workoutsData = await res.json();
    renderWorkoutList(workoutsData);
    renderMainChart(workoutsData);
}

// Render main chart: Weight per exercise over time
function renderMainChart(workouts) {
    // Group by exercise
    const exercises = [...new Set(workouts.map(w => w.exercise))];
    const labels = [...new Set(workouts.map(w => w.date))];

    const datasets = exercises.map((ex, i) => {
        const data = labels.map(date => {
            const w = workouts.find(wk => wk.exercise === ex && wk.date === date);
            return w ? w.weight : null;
        });
        return {
            label: ex,
            data,
            borderColor: getRandomColor(),
            fill: false,
            tension: 0.2
        };
    });

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("mainChart"), {
        type: "line",
        data: { labels, datasets },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

// Workout list with edit/delete
function renderWorkoutList(workouts) {
    const listDiv = document.getElementById("workout-list");
    listDiv.innerHTML = "";
    workouts.forEach((w, i) => {
        const div = document.createElement("div");
        div.className = "workout-item";
        div.innerHTML = `
            <strong>${w.date} - ${w.bodyPart} - ${w.exercise}</strong><br>
            ${w.sets} sets x ${w.reps} reps @ ${w.weight} lbs<br>
            Notes: ${w.notes || "-"}<br>
            <button onclick="editWorkout(${i})">Edit</button>
            <button onclick="deleteWorkout(${i})">Delete</button>
        `;
        listDiv.appendChild(div);
    });
}

async function deleteWorkout(index) {
    await fetch(`http://localhost:5000/workouts/${index}`, { method: "DELETE" });
    loadWorkouts();
}

function editWorkout(index) {
    const w = workoutsData[index];
    document.getElementById("bodyPart").value = w.bodyPart;
    populateExercises(w.bodyPart, "exercise");
    document.getElementById("exercise").value = w.exercise;
    document.getElementById("sets").value = w.sets;
    document.getElementById("reps").value = w.reps;
    document.getElementById("weight").value = w.weight;
    document.getElementById("notes").value = w.notes;
    deleteWorkout(index);
}

// Filters
function applyFilters() {
    const bodyPart = document.getElementById("filterBodyPart").value;
    const exercise = document.getElementById("filterExercise").value;
    let filtered = [...workoutsData];
    if (bodyPart) filtered = filtered.filter(w => w.bodyPart === bodyPart);
    if (exercise) filtered = filtered.filter(w => w.exercise === exercise);
    renderWorkoutList(filtered);
    renderMainChart(filtered);
}

function clearFilters() {
    document.getElementById("filterBodyPart").value = "";
    document.getElementById("filterExercise").value = "";
    renderWorkoutList(workoutsData);
    renderMainChart(workoutsData);
}

// Random color generator
function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
}

// Initial load
loadWorkouts();
