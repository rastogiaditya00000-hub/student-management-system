const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");

const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const message = document.getElementById("message");

let editingStudentId = null;
let studentsCache = [];

// Show success or error message
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

// Reset form
function resetForm() {
    studentForm.reset();

    editingStudentId = null;
    formTitle.textContent = "Add New Student";
    submitBtn.textContent = "Add Student";
    cancelEditBtn.hidden = true;
}

// GET: Load all students
async function loadStudents() {
    try {
        const response = await fetch("/api/students");
        const students = await response.json();

        if (!response.ok) {
            throw new Error(students.message || "Unable to load students");
        }

        studentsCache = students;
        studentList.replaceChildren();

        if (students.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.textContent = "No students found";

            row.appendChild(cell);
            studentList.appendChild(row);
            return;
        }

        students.forEach((student) => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            const emailCell = document.createElement("td");
            const courseCell = document.createElement("td");
            const actionsCell = document.createElement("td");

            nameCell.textContent = student.name;
            emailCell.textContent = student.email;
            courseCell.textContent = student.course;

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.className = "edit-btn";
            editBtn.dataset.action = "edit";
            editBtn.dataset.id = student._id;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "delete-btn";
            deleteBtn.dataset.action = "delete";
            deleteBtn.dataset.id = student._id;

            actionsCell.append(editBtn, deleteBtn);
            row.append(nameCell, emailCell, courseCell, actionsCell);

            studentList.appendChild(row);
        });

    } catch (error) {
        showMessage(error.message, "error");
    }
}

// POST and PUT: Add or update student
studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const studentData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        course: document.getElementById("course").value
    };

    const url = editingStudentId
        ? `/api/students/${editingStudentId}`
        : "/api/students";

    const method = editingStudentId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Something went wrong");
        }

        showMessage(result.message, "success");

        resetForm();
        await loadStudents();

    } catch (error) {
        showMessage(error.message, "error");
    }
});

// Edit and delete buttons
studentList.addEventListener("click", async (event) => {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    // EDIT
    if (action === "edit") {

        const student = studentsCache.find(
            (item) => item._id === id
        );

        if (!student) return;

        document.getElementById("name").value = student.name;
        document.getElementById("email").value = student.email;
        document.getElementById("course").value = student.course;

        editingStudentId = id;

        formTitle.textContent = "Update Student";
        submitBtn.textContent = "Update Student";
        cancelEditBtn.hidden = false;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // DELETE
    if (action === "delete") {

        const confirmDelete = confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/students/${id}`, {
                method: "DELETE"
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Delete failed");
            }

            showMessage(result.message, "success");
            await loadStudents();

        } catch (error) {
            showMessage(error.message, "error");
        }
    }
});

// Cancel editing
cancelEditBtn.addEventListener("click", resetForm);

// Load records when website opens
loadStudents();