const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/mentor-student", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const MentorSchema = new mongoose.Schema({
    name: String,
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
});

const StudentSchema = new mongoose.Schema({
    name: String,
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" },
    previousMentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" },
});

const Mentor = mongoose.model("Mentor", MentorSchema);
const Student = mongoose.model("Student", StudentSchema);

// Create Mentor
app.post("/mentors", async (req, res) => {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.send(mentor);
});

// Create Student
app.post("/students", async (req, res) => {
    const student = new Student(req.body);
    await student.save();
    res.send(student);
});

// Get all Mentors
app.get("/mentors", async (req, res) => {
    const mentors = await Mentor.find();
    res.send(mentors);
});

// Get all Students
app.get("/students", async (req, res) => {
    const students = await Student.find();
    res.send(students);
});

// Assign Student to a Mentor
app.put("/assign-mentor/:studentId", async (req, res) => {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).send("Student not found");
    
    if (student.mentor) {
        student.previousMentor = student.mentor;
    }
    student.mentor = req.body.mentorId;
    await student.save();
    
    const mentor = await Mentor.findById(req.body.mentorId);
    mentor.students.push(student._id);
    await mentor.save();

    res.send(student);
});

// Get all Students for a Mentor
app.get("/mentors/:mentorId/students", async (req, res) => {
    const mentor = await Mentor.findById(req.params.mentorId).populate("students");
    if (!mentor) return res.status(404).send("Mentor not found");
    res.send(mentor.students);
});

// Get Previously Assigned Mentor for a Student
app.get("/students/:studentId/previous-mentor", async (req, res) => {
    const student = await Student.findById(req.params.studentId).populate("previousMentor");
    if (!student) return res.status(404).send("Student not found");
    res.send(student.previousMentor || "No previous mentor");
});

app.listen(3000, () => console.log("Server is running on port 3000"));
