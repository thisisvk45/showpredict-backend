// ===========================
// Storage Helper
// ===========================
const Storage = {
    getUser: () => localStorage.getItem("showpredict_user"),
    getReportData: () => {
        const raw = localStorage.getItem("showpredict_report");
        return raw ? JSON.parse(raw) : null;
    }
};

let trendsChart = null;
let currentChartType = "bar";

// ===========================
// DOM READY
// ===========================
document.addEventListener("DOMContentLoaded", async () => {
    const username = Storage.getUser();
    if (!username) return (window.location.href = "index.html");

    const reportData = Storage.getReportData();
    if (!reportData) return (window.location.href = "main.html");

    document.getElementById("welcomeText").textContent = `Welcome, ${username}`;
    populateReport(reportData);

    // Chart toggle buttons
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentChartType = btn.textContent.trim().toLowerCase();
            recreateChart();
        });
    });
});

// ===========================
// POPULATE REPORT
// ===========================
function populateReport(data) {
    // Artist & Venue Info
    document.getElementById("artistName").textContent = data.artist;
    document.getElementById("headerArtist").textContent = data.artist;
    document.getElementById("venueInfo").textContent = 
        `@ ${data.venue} on ${formatDate(data.date)}`;

    const venueStats = data.venue_stats || {};
    const ticketPrediction = data.predicted_tickets || {};

    // Expected Ticket Sales with Range and % Above Average
    if (ticketPrediction.expected) {
        document.getElementById("expectedSalesRange").textContent = 
            `${ticketPrediction.low}-${ticketPrediction.high}`;
        
        // Calculate % above/below average
        const avgLastYear = venueStats.avg_tickets_last_1_year || 100;
        const percentAbove = Math.round(((ticketPrediction.expected - avgLastYear) / avgLastYear) * 100);
        
        if (percentAbove >= 0) {
            document.getElementById("expectedPercentage").textContent = 
                `${percentAbove}% above average`;
        } else {
            document.getElementById("expectedPercentage").textContent = 
                `${Math.abs(percentAbove)}% below average`;
        }
    }

    // Weather
    if (data.weather && Object.keys(data.weather).length) {
        const condition = data.weather.conditions || "Unknown";
        const tempC = data.weather.temperature || 0;
        const tempF = Math.round((tempC * 9/5) + 32);
        
        document.getElementById("weatherCondition").textContent = condition;
        document.getElementById("weatherTemp").textContent = `${tempF}°F`;
    }

    // Last Play Information (FIXED LOGIC)
    const artistVenueInfo = data.artist_venue_info || {};
    
    if (artistVenueInfo.last_play_date && artistVenueInfo.last_play_date !== null) {
        // Artist HAS played here before
        document.getElementById("lastPlayDate").textContent = artistVenueInfo.last_play_date;
        
        // Show subtitle with tickets and times played
        const lastPlaySubtitle = document.getElementById("lastPlaySubtitle");
        lastPlaySubtitle.classList.remove("hide-info");
        
        // Estimate tickets sold from last play
        const estimatedLastPlayTickets = Math.round(venueStats.avg_tickets_last_1_year || ticketPrediction.expected || 300);
        document.getElementById("lastPlayTickets").textContent = estimatedLastPlayTickets;
        document.getElementById("timesPlayed").textContent = artistVenueInfo.times_played || 0;
    } else {
        // Artist has NEVER played here
        document.getElementById("lastPlayDate").textContent = "Never";
        
        // Hide the subtitle (tickets sold and times played)
        const lastPlaySubtitle = document.getElementById("lastPlaySubtitle");
        lastPlaySubtitle.classList.add("hide-info");
    }

    // Social Media Stats (Detailed)
    populateSocialStats(data.cm_data);

    // Competition Table
    populateCompetitionTable(data.competing_shows);

    // Venue Stats
    document.getElementById("avgLastMonth").textContent = roundOrDash(venueStats.avg_tickets_last_1_month);
    document.getElementById("avgLastYear").textContent = roundOrDash(venueStats.avg_tickets_last_1_year);
    document.getElementById("eventsLastMonth").textContent = roundOrDash(venueStats.events_last_1_month);
    document.getElementById("eventsLastYear").textContent = roundOrDash(venueStats.events_last_1_year);

    // Historical Chart
    const history = venueStats.history_last_6_months || [];
    const labels = history.map(h => h.month);
    const values = history.map(h => h.tickets);
    
    window._chartLabels = labels;
    window._chartValues = values;
    createTrendsChart(labels, values);

    // Raw Data
    document.getElementById("weatherData").textContent = JSON.stringify(data.weather, null, 2);
    document.getElementById("artistData").textContent = JSON.stringify(data.cm_data, null, 2);
    document.getElementById("featuresData").textContent = JSON.stringify(data.features_used, null, 2);
}

// ===========================
// SOCIAL MEDIA STATS (Detailed)
// ===========================
function populateSocialStats(cmData = {}) {
    // Spotify
    document.getElementById("spotifyListeners").textContent = 
        formatNumber(cmData.spotify_monthly_listeners || 0);
    document.getElementById("spotifyFollowers").textContent = 
        formatNumber(cmData.spotify_followers || 0);

    // Instagram
    document.getElementById("instaFollowers").textContent = 
        formatNumber(cmData.instagram_total_followers || 0);
    
    // Estimate likes and comments (Chartmetric doesn't provide these directly)
    const instaFollowers = cmData.instagram_total_followers || 0;
    const engagementRate = cmData.instagram_engagement_rate || 3;
    const avgLikes = Math.round((instaFollowers * engagementRate) / 100);
    const avgComments = Math.round(avgLikes * 0.25); // ~25% of likes
    
    document.getElementById("instaLikes").textContent = formatNumber(avgLikes);
    document.getElementById("instaComments").textContent = formatNumber(avgComments);

    // TikTok
    document.getElementById("tiktokFollowers").textContent = 
        formatNumber(cmData.tiktok_total_followers || 0);
    
    // Estimate TikTok engagement (rough estimates based on typical rates)
    const tiktokFollowers = cmData.tiktok_total_followers || 0;
    const tiktokLikes = Math.round(tiktokFollowers * 0.28); // ~28% engagement typical
    const tiktokComments = Math.round(tiktokLikes * 0.06); // ~6% of likes
    
    document.getElementById("tiktokLikes").textContent = formatNumber(tiktokLikes);
    document.getElementById("tiktokComments").textContent = formatNumber(tiktokComments);
}

// ===========================
// COMPETITION TABLE
// ===========================
function populateCompetitionTable(competingShows = {}) {
    const tbody = document.getElementById("competitionTableBody");
    
    if (!competingShows.events || competingShows.events.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #6e6e73;">
                    No competing events in the next 7 days
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = competingShows.events.map(event => `
        <tr>
            <td>Nearby Venue</td>
            <td>${event.name}</td>
            <td>Various</td>
            <td>${formatDateShort(event.date)}</td>
        </tr>
    `).join('');
}

// ===========================
// CHART
// ===========================
function createTrendsChart(labels, values) {
    const ctx = document.getElementById("trendsChart");
    if (!ctx) return;

    if (trendsChart) trendsChart.destroy();

    const avg = values.length > 0
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 0;

    document.getElementById("chartSubtitle").textContent = 
        `Last 6 months • Average: ${avg} tickets`;

    const dataset = {
        label: "Tickets",
        data: values,
        backgroundColor: "rgba(211, 204, 227, 0.8)",
        borderColor: "#9b87f5",
        borderWidth: 0,
        borderRadius: 6,
        tension: 0.4
    };

    trendsChart = new Chart(ctx, {
        type: currentChartType,
        data: {
            labels,
            datasets: [dataset]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f5f5f7'
                    },
                    ticks: {
                        color: '#6e6e73'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6e6e73'
                    }
                }
            }
        }
    });
}

function recreateChart() {
    createTrendsChart(window._chartLabels, window._chartValues);
}

// ===========================
// RAW DATA TOGGLE
// ===========================
function toggleRawData() {
    const content = document.getElementById("rawDataContent");
    const icon = document.getElementById("expandIcon");
    
    if (content.classList.contains("expanded")) {
        content.classList.remove("expanded");
        icon.classList.remove("rotated");
    } else {
        content.classList.add("expanded");
        icon.classList.add("rotated");
    }
}
window.toggleRawData = toggleRawData;

// ===========================
// UTILITY FUNCTIONS
// ===========================
function roundOrDash(v) {
    return typeof v === "number" ? Math.round(v) : "-";
}

function formatNumber(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric"
    });
}
