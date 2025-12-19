// ===========================
// Configuration
// ===========================
// Automatically detect API URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:8000/api"  // Local development
    : "https://showpredict-backend.onrender.com/api";  // Production

// ===========================
// Utility Functions
// ===========================
function showError(message, elementId = "errorMessage") {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add("show");
        setTimeout(() => {
            errorEl.classList.remove("show");
        }, 5000);
    }
}

function hideError(elementId = "errorMessage") {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.classList.remove("show");
    }
}

function setButtonLoading(buttonId, isLoading) {
    const btn = document.getElementById(buttonId);
    if (btn) {
        if (isLoading) {
            btn.classList.add("loading");
            btn.disabled = true;
        } else {
            btn.classList.remove("loading");
            btn.disabled = false;
        }
    }
}

// ===========================
// Local Storage Helper (UPDATED)
// ===========================
const Storage = {
    setUser: (username) => {
        localStorage.setItem("showpredict_user", username);
    },
    getUser: () => {
        return localStorage.getItem("showpredict_user");
    },
    clearUser: () => {
        localStorage.removeItem("showpredict_user");
    },
    // NEW: Store and retrieve user's venue
    setVenue: (venue) => {
        localStorage.setItem("showpredict_venue", venue);
    },
    getVenue: () => {
        return localStorage.getItem("showpredict_venue");
    },
    clearVenue: () => {
        localStorage.removeItem("showpredict_venue");
    },
    setReportData: (data) => {
        localStorage.setItem("showpredict_report", JSON.stringify(data));
    },
    getReportData: () => {
        const data = localStorage.getItem("showpredict_report");
        return data ? JSON.parse(data) : null;
    }
};

// ===========================
// Login Page Logic (UPDATED)
// ===========================
if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            hideError();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;

            if (!username || !password) {
                showError("Please enter both username and password");
                return;
            }

            setButtonLoading("loginBtn", true);

            try {
                const response = await axios.post(`${API_BASE_URL}/login`, {
                    username: username,
                    password: password
                });

                if (response.data && response.data.success) {
                    Storage.setUser(username);
                    Storage.setVenue(response.data.venue);  // NEW: Store user's venue
                    window.location.href = "main.html";
                } else {
                    showError("Invalid username or password");
                }
            } catch (error) {
                console.error("Login error:", error);
                if (error.response && error.response.status === 401) {
                    showError("Invalid username or password");
                } else {
                    showError("Login failed. Please try again.");
                }
            } finally {
                setButtonLoading("loginBtn", false);
            }
        });
    }
}

// ===========================
// Main Form Page Logic (UPDATED)
// ===========================
if (window.location.pathname.endsWith("main.html")) {
    const username = Storage.getUser();
    const userVenue = Storage.getVenue();  // NEW: Get user's venue

    if (!username || !userVenue) {
        // If no user or venue, redirect to login
        window.location.href = "index.html";
    }

    const welcomeText = document.getElementById("welcomeText");
    if (welcomeText && username) {
        welcomeText.textContent = `Welcome, ${username}`;
    }

    // NEW: Pre-select and disable venue dropdown
    const venueSelect = document.getElementById("venueName");
    if (venueSelect && userVenue) {
        venueSelect.value = userVenue;
        venueSelect.disabled = true;  // Disable dropdown - user can't change it
        
        // Add visual feedback that it's locked
        venueSelect.style.backgroundColor = "#f3f4f6";
        venueSelect.style.cursor = "not-allowed";
    }

    const dateInput = document.getElementById("showDate");
    if (dateInput) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.setAttribute("min", today);
        dateInput.value = today;
    }

    const predictForm = document.getElementById("predictForm");
    if (predictForm) {
        predictForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            hideError();

            const artistName = document.getElementById("artistName").value.trim();
            const venueName = document.getElementById("venueName").value;
            const showDate = document.getElementById("showDate").value;

            if (!artistName || !venueName || !showDate) {
                showError("Please fill in all fields");
                return;
            }

            // NEW: Security check - verify venue matches user's assigned venue
            if (venueName !== userVenue) {
                showError("You can only generate reports for your assigned venue");
                return;
            }

            setButtonLoading("generateBtn", true);

            try {
                const response = await axios.post(`${API_BASE_URL}/predict`, {
                    artist: artistName,
                    venue: venueName,
                    date: showDate
                });

                if (response.data) {
                    Storage.setReportData({
                        ...response.data,
                        artist: artistName,
                        venue: venueName,
                        date: showDate
                    });

                    window.location.href = "report.html";
                } else {
                    showError("Failed to generate report. Please try again.");
                }

            } catch (error) {
                console.error("Prediction error:", error);

                if (error.response && error.response.data && error.response.data.error) {
                    showError(error.response.data.error);
                } else {
                    showError("Failed to generate report. Please check your inputs and try again.");
                }
            } finally {
                setButtonLoading("generateBtn", false);
            }
        });
    }
}
