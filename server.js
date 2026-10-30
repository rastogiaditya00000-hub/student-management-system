const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const Student = require("./models/Student");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// GET: Display all students
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST: Add new student
app.post("/api/students", async (req, res) => {
    try {
        const { name, email, course } = req.body;

        if (!name || !email || !course) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const student = await Student.create({
            name,
            email,
            course
        });

        res.status(201).json({
            message: "Student added successfully",
            student
        });
    } catch (error) {
        res.status(error.name === "ValidationError" ? 400 : 500)
            .json({ message: error.message });
    }
});

// PUT: Update student
app.put("/api/students/:id", async (req, res) => {
    try {
        const { name, email, course } = req.body;

        if (!name || !email || !course) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { name, email, course },
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student updated successfully",
            student
        });
    } catch (error) {
        res.status(error.name === "ValidationError" ||
                   error.name === "CastError" ? 400 : 500)
            .json({ message: error.message });
    }
});

// DELETE: Delete student
app.delete("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(error.name === "CastError" ? 400 : 500)
            .json({ message: error.message });
    }
});

// Connect MongoDB and start server
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
}

startServer();