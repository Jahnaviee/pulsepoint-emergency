
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the existing frontend files
app.use(express.static(path.join(__dirname, "..")));

// Test the backend
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "PulsePoint Emergency backend is running!"
    });
});

// Handle appointment form submissions
app.post("/api/appointments", (req, res) => {
    const {
        patientName,
        phone,
        email,
        department,
        appointmentDate,
        appointmentTime,
        reason,
        consent
    } = req.body;

    if (
        !patientName ||
        !phone ||
        !department ||
        !appointmentDate ||
        !appointmentTime ||
        !consent
    ) {
        return res.status(400).json({
            success: false,
            message: "Please complete all required fields and accept consent."
        });
    }

    if (patientName.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid patient name."
        });
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid 10-digit phone number."
        });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid email address."
        });
    }

    const departments = [
        "General Medicine",
        "Cardiology",
        "Pediatrics",
        "Orthopedics",
        "Obstetrics and Gynecology",
        "Outpatient Department"
    ];

    if (!departments.includes(department)) {
        return res.status(400).json({
            success: false,
            message: "Please select a valid department."
        });
    }

    const validTimes = [
        "09:00", "10:00", "11:00", "12:00",
        "14:00", "15:00", "16:00"
    ];

    if (!validTimes.includes(appointmentTime)) {
        return res.status(400).json({
            success: false,
            message: "Please select a valid appointment time."
        });
    }

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) ||
        Number.isNaN(Date.parse(appointmentDate)) ||
        new Date(appointmentDate).toISOString().slice(0, 10) !== appointmentDate
    ) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid appointment date."
        });
    }

    const today = new Date();
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    if (appointmentDate < todayString) {
        return res.status(400).json({
            success: false,
            message: "Appointment date cannot be in the past."
        });
    }

    if (reason && reason.length > 1000) {
        return res.status(400).json({
            success: false,
            message: "The reason must be under 1000 characters."
        });
    }

    // Demonstration only: no database is used.
    const appointmentId = "PP-" + Date.now().toString().slice(-8);

    console.log("Appointment request received:", {
        appointmentId,
        patientName: patientName.trim(),
        department,
        appointmentDate,
        appointmentTime
    });

    res.status(201).json({
        success: true,
        message: "Appointment request submitted successfully!",
        appointmentId,
        status: "Request received"
    });
});

// Handle unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`PulsePoint Emergency running at http://localhost:${PORT}`);
});
