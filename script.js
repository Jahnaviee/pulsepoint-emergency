
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    // Automatically display the current year in the footer
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    const appointmentForm = document.getElementById("appointment-form");

    if (!appointmentForm) {
        return;
    }

    const dateInput = document.getElementById("appointmentDate");
    const statusMessage = document.getElementById("appointment-status");
    const submitButton = appointmentForm.querySelector(
        'button[type="submit"]'
    );

    // Use the computer's local date, without UTC date shifting
    function getLocalDate() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    // Prevent selecting a date in the past
    if (dateInput) {
        dateInput.min = getLocalDate();
    }

    appointmentForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Let HTML validate required fields and input formats first
        if (!appointmentForm.checkValidity()) {
            appointmentForm.reportValidity();
            return;
        }

        const formData = new FormData(appointmentForm);

        const appointment = {
            patientName: String(formData.get("patientName") || "").trim(),
            phone: String(formData.get("phone") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            department: formData.get("department"),
            appointmentDate: formData.get("appointmentDate"),
            appointmentTime: formData.get("appointmentTime"),
            reason: String(formData.get("reason") || "").trim(),
            consent: document.getElementById("appointment-consent").checked
        };

        statusMessage.textContent = "Submitting your request...";
        statusMessage.style.color = "#754d94";

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        try {
            // Send the form details to the Express backend
            const response = await fetch("/api/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(appointment)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to submit your request."
                );
            }

            statusMessage.textContent =
                `${result.message} Reference: ${result.appointmentId}`;

            statusMessage.style.color = "green";

            appointmentForm.reset();

            // Reapply the minimum date after resetting the form
            if (dateInput) {
                dateInput.min = getLocalDate();
            }

        } catch (error) {
            console.error("Appointment submission error:", error);

            statusMessage.textContent =
                error.message ||
                "Unable to connect to the server. Please try again.";

            statusMessage.style.color = "red";

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Submit Appointment Request";
            }
        }
    });
});
