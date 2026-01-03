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

    // Expected Ticket Sales with 10% Confidence Interval
    if (ticketPrediction.expected) {
        const expected = ticketPrediction.expected;
        
        // Calculate 10% confidence interval
        const margin = Math.round(expected * 0.10);
        const ciLow = Math.max(0, expected - margin);
        const ciHigh = expected + margin;
        
        // Display range with confidence interval
        document.getElementById("expectedSalesRange").textContent = 
            `${ciLow}-${ciHigh}`;
        
        // Calculate % above/below average
        const avgLastYear = venueStats.avg_tickets_last_1_year || 100;
        const percentAbove = Math.round(((expected - avgLastYear) / avgLastYear) * 100);
        
        if (percentAbove >= 0) {
            document.getElementById("expectedPercentage").textContent = 
                `${percentAbove}% above average (±10% CI)`;
        } else {
            document.getElementById("expectedPercentage").textContent = 
                `${Math.abs(percentAbove)}% below average (±10% CI)`;
        }
    }

    // Weather
    if (data.weather && Object.keys(data.weather).length) {
        const condition = data.weather.conditions || "Unknown";
        const tempC = data.weather.temperature || 0;
        const tempF = Math.round((tempC * 9/5) + 32);
        
        document.getElementById("weatherCondition").textContent = condition;
        document.getElementById("weatherTemp").textContent = `${tempF}°F`;
    } else {
        // If weather data is missing
        document.getElementById("weatherCondition").textContent = "N/A";
        document.getElementById("weatherTemp").textContent = "No data available";
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

    // Competition Table (UPDATED - Parse venue from artist name)
    populateCompetitionTable(data.competing_shows);

    // Venue Stats
    document.getElementById("avgLastMonth").textContent = roundOrDash(venueStats.avg_tickets_last_1_month);
    document.getElementById("avgLastYear").textContent = roundOrDash(venueStats.avg_tickets_last_1_year);
    document.getElementById("eventsLastMonth").textContent = roundOrDash(venueStats.events_last_1_month);
    document.getElementById("eventsLastYear").textContent = roundOrDash(venueStats.events_last_1_year);

    // Ticket Price (from venue_stats) - FIXED: NO $35 FALLBACK
    const ticketPrice = venueStats.avg_ticket_price;
    if (ticketPrice && ticketPrice > 0) {
        document.getElementById("avgTicketPrice").textContent = `$${Math.round(ticketPrice)}`;
        document.getElementById("avgPriceSubtitle").textContent = `Historical average`;
    } else {
        document.getElementById("avgTicketPrice").textContent = `N/A`;
        document.getElementById("avgPriceSubtitle").textContent = `No pricing data available`;
    }

    // Historical Chart
    const history = venueStats.history_last_6_months || [];
    const labels = history.map(h => h.month);
    const values = history.map(h => h.tickets);
    
    window._chartLabels = labels;
    window._chartValues = values;
    createTrendsChart(labels, values);

    // Raw Data with Fahrenheit conversion for weather
    const weatherDataForDisplay = convertWeatherToFahrenheit(data.weather);
    document.getElementById("weatherData").textContent = JSON.stringify(weatherDataForDisplay, null, 2);
    document.getElementById("artistData").textContent = JSON.stringify(data.cm_data, null, 2);
    document.getElementById("competitionData").textContent = JSON.stringify(data.competing_shows, null, 2);
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
// COMPETITION TABLE (Show first 2 events only)
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

    // Show only first 2 events in the table
    const displayEvents = competingShows.events.slice(0, 2);
    
    tbody.innerHTML = displayEvents.map(event => {
        // Parse artist name to extract venue
        // Format: "Artist Name at Venue Name"
        let artistName = event.name;
        let venueName = "Nearby Venue";
        
        if (event.name && event.name.includes(" at ")) {
            const parts = event.name.split(" at ");
            artistName = parts[0].trim();
            venueName = parts.slice(1).join(" at ").trim(); // Handle multiple " at " in name
        }
        
        // Parse genre - show only first genre (before first comma)
        let genre = event.genre || "Various";
        if (genre.includes(",")) {
            genre = genre.split(",")[0].trim();
        }
        
        return `
            <tr>
                <td>${venueName}</td>
                <td>${artistName}</td>
                <td>${genre}</td>
                <td>${formatDateShort(event.date)}</td>
            </tr>
        `;
    }).join('');
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

// Convert weather temperatures from Celsius to Fahrenheit for raw data display
function convertWeatherToFahrenheit(weather) {
    if (!weather || typeof weather !== 'object') return weather;
    
    const converted = { ...weather };
    
    // Convert all temperature fields
    if (converted.temperature !== undefined) {
        converted.temperature = Math.round((converted.temperature * 9/5) + 32);
        converted.temperature_unit = "°F";
    }
    if (converted.feels_like !== undefined) {
        converted.feels_like = Math.round((converted.feels_like * 9/5) + 32);
    }
    if (converted.temp_min !== undefined) {
        converted.temp_min = Math.round((converted.temp_min * 9/5) + 32);
    }
    if (converted.temp_max !== undefined) {
        converted.temp_max = Math.round((converted.temp_max * 9/5) + 32);
    }
    
    return converted;
}
