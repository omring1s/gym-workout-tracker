const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let workouts = [];

app.post("/workouts", (req, res) => {
    const workout = req.body;
    workouts.push(workout);
    res.json(workout);
});

app.get("/workouts", (req, res) => {
    res.json(workouts);
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
