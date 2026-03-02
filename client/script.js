let chart;


const exercisesByBodyPart = {
    Chest: ["Dips", "Incline Bench", "Chest Fly"],
    Back: ["Lat Pulldown", "Close-Grip Row", "T-Bar Row"],
    Legs: ["Pendulum Squat", "Leg Curl", "SLDL", "Adductor", "Hip Thrust", "Abductor", "Leg Extension"],
    Shoulders: ["Overhead Press", "Lateral Raise"],
    Arms: ["Bicep Curl", "Tricep Extension", "Hammer Curl", "JM Press"],
    Core: ["Crunch"]
};

// Populate exercises based on body part
document.getElementById("bodyPart").addEventListener("change", (e) => {
    const bodyPart = e.target.value;
    const exerciseSelect = document.getElementById("exercise");
    exerciseSelect.innerHTML = '<option value="">Select Exercise</option>';
    if (exercisesByBodyPart[bodyPart]) {
        exercisesByBodyPart[bodyPart].forEach(ex => {
            const opt = document.createElement("option");
            opt.value = ex;
            opt.textContent = ex;
            exerciseSelect.appendChild(opt);
        });
    }
});

async function loadWorkouts() {
    const res = await fetch("http://localhost:5000/workouts");
    const workouts = await res.json();

    const labels = workouts.map(w => w.date);
    const datasets = [];
    const exercises = [...new Set(workouts.map(w => w.exercise))];

    exercises.forEach(ex => {
        const exWorkouts = workouts.filter(w => w.exercise === ex);
        datasets.push({
            label: ex,
            data: exWorkouts.map(w => w.weight),
            borderColor: getRandomColor(),
            fill: false
        });
    });

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("chart"), {
        type: "line",
        data: { labels, datasets }
    });

    const listDiv = document.getElementById("workout-list");
    listDiv.innerHTML = "";
    workouts.forEach((w, i) => {
        const div = document.createElement("div");
        div.className = "workout-item";
        div.innerHTML = `
            <strong>${w.date} - ${w.bodyPart} - ${w.exercise}</strong> <br>
            ${w.sets || 1} sets x ${w.reps} reps @ ${w.weight} lbs <br>
            Notes: ${w.notes || "-"} <br>
            <button onclick="deleteWorkout(${i})">Delete</button>
        `;
        listDiv.appendChild(div);
    });
}

async function addWorkout() {
    const bodyPart = document.getElementById("bodyPart").value;
    const exercise = document.getElementById("exercise").value;
    const weight = document.getElementById("weight").value;
    const reps = document.getElementById("reps").value;
    const notes = document.getElementById("notes").value;

    if (!bodyPart || !exercise || !weight || !reps) {
        alert("Please fill all required fields");
        return;
    }

    const workout = {
        bodyPart,
        exercise,
        weight: Number(weight),
        reps: Number(reps),
        notes,
        date: new Date().toLocaleDateString()
    };

    await fetch("http://localhost:5000/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workout)
    });

    document.getElementById("weight").value = "";
    document.getElementById("reps").value = "";
    document.getElementById("notes").value = "";

    loadWorkouts();
}

async function deleteWorkout(index) {
    await fetch(`http://localhost:5000/workouts/${index}`, { method: "DELETE" });
    loadWorkouts();
}

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
}

// Initial load
loadWorkouts();
