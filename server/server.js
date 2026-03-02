const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "workouts.json");

let workouts = [];
if (fs.existsSync(DATA_FILE)) {
    workouts = JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveWorkouts() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(workouts, null, 4));
}

app.post("/workouts", (req, res) => {
    const workout = req.body;
    workouts.push(workout);
    saveWorkouts();
    res.json(workout);
});

app.get("/workouts", (req, res) => {
    res.json(workouts);
});

app.delete("/workouts/:index", (req, res) => {
    const idx = parseInt(req.params.index);
    if (!isNaN(idx) && workouts[idx]) {
        const removed = workouts.splice(idx, 1);
        saveWorkouts();
        res.json(removed[0]);
    } else {
        res.status(400).json({ error: "Invalid index" });
    }
});

app.put("/workouts/:index", (req, res) => {
    const idx = parseInt(req.params.index);
    if (!isNaN(idx) && workouts[idx]) {
        workouts[idx] = req.body;
        saveWorkouts();
        res.json(workouts[idx]);
    } else {
        res.status(400).json({ error: "Invalid index" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
