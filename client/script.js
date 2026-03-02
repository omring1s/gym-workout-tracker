let chart;
let workoutsData = [];

// Map body parts to exercises
const exercisesByBodyPart = {
    Chest: ["Bench Press", "Incline Bench", "Chest Fly"],
    Back: ["Pull-Up", "Deadlift", "Bent Over Row"],
    Legs: ["Squat", "Leg Press", "Lunge"],
    Shoulders: ["Overhead Press", "Lateral Raise", "Front Raise"],
    Arms: ["Bicep Curl", "Tricep Extension", "Hammer Curl"],
    Core: ["Plank", "Crunch", "Leg Raise"]
};

// Populate exercises based on body part
document.getElementById("bodyPart").addEventListener("change", (e) => {
    populateExercises(e.target.value, "exercise");
});

document.getElementById("filterBodyPart").addEventListener("change", (e) => {
    populateExercises(e.target.value, "filterExercise");
});

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
    document.getElementById("weight").value = "";
    document.getElementById("reps").value = "";
    document.getElementById("sets").value = "";
    document.getElementById("notes").value = "";
    document.getElementById("exercise").value = "";
    document.getElementById("bodyPart").value = "";
}

// Load and display workouts
async function loadWorkouts() {
    const res = await fetch("http://localhost:5000/workouts");
    workoutsData = await res.json();
    renderWorkoutList(workoutsData);
    renderChart(workoutsData);
}

// Render chart showing total volume
function renderChart(workouts) {
    const labels = workouts.map(w => w.date + " " + w.exercise);
    const data = workouts.map(w => w.weight * w.reps * w.sets);

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("chart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Total Volume (Weight × Reps × Sets)",
                data,
                backgroundColor: labels.map(() => getRandomColor())
            }]
        },
        options: { responsive: true }
    });
}

// Render workout list with edit/delete
function renderWorkoutList(workouts) {
    const listDiv = document.getElementById("workout-list");
    listDiv.innerHTML = "";
    workouts.forEach((w, i) => {
        const div = document.createElement("div");
        div.className = "workout-item";
        div.innerHTML = `
            <strong>${w.date} - ${w.bodyPart} - ${w.exercise}</strong> <br>
            ${w.sets} sets x ${w.reps} reps @ ${w.weight} lbs <br>
            Notes: ${w.notes || "-"} <br>
            <button onclick="editWorkout(${i})">Edit</button>
            <button onclick="deleteWorkout(${i})">Delete</button>
        `;
        listDiv.appendChild(div);
    });
}

// Delete workout
async function deleteWorkout(index) {
    await fetch(`http://localhost:5000/workouts/${index}`, { method: "DELETE" });
    loadWorkouts();
}

// Edit workout
function editWorkout(index) {
    const w = workoutsData[index];
    document.getElementById("bodyPart").value = w.bodyPart;
    populateExercises(w.bodyPart, "exercise");
    document.getElementById("exercise").value = w.exercise;
    document.getElementById("sets").value = w.sets;
    document.getElementById("reps").value = w.reps;
    document.getElementById("weight").value = w.weight;
    document.getElementById("notes").value = w.notes;

    // Delete old entry on save
    deleteWorkout(index);
}

// Apply / Clear Filters
function applyFilters() {
    const bodyPart = document.getElementById("filterBodyPart").value;
    const exercise = document.getElementById("filterExercise").value;
    let filtered = [...workoutsData];
    if (bodyPart) filtered = filtered.filter(w => w.bodyPart === bodyPart);
    if (exercise) filtered = filtered.filter(w => w.exercise === exercise);
    renderWorkoutList(filtered);
    renderChart(filtered);
}

function clearFilters() {
    document.getElementById("filterBodyPart").value = "";
    document.getElementById("filterExercise").value = "";
    renderWorkoutList(workoutsData);
    renderChart(workoutsData);
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
