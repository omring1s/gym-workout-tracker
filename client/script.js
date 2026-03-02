let chart;

async function addWorkout() {
    const exercise = document.getElementById("exercise").value;
    const weight = document.getElementById("weight").value;
    const reps = document.getElementById("reps").value;

    if (!exercise || !weight || !reps) {
        alert("Please fill in all fields");
        return;
    }

    const workout = {
        exercise,
        weight: Number(weight),
        reps: Number(reps),
        date: new Date().toLocaleDateString()
    };

    await fetch("http://localhost:5000/workouts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(workout)
    });

    document.getElementById("exercise").value = "";
    document.getElementById("weight").value = "";
    document.getElementById("reps").value = "";

    loadWorkouts();
}

async function loadWorkouts() {
    const res = await fetch("http://localhost:5000/workouts");
    const workouts = await res.json();

    const exercises = [...new Set(workouts.map(w => w.exercise))];
    const datasets = exercises.map(ex => {
        const exWorkouts = workouts.filter(w => w.exercise === ex);
        return {
            label: ex,
            data: exWorkouts.map(w => w.weight),
            borderColor: getRandomColor(),
            fill: false
        };
    });

    const labels = workouts.map(w => w.date);

    const data = { labels, datasets };

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("chart"), {
        type: "line",
        data: data,
        options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
}

loadWorkouts();
