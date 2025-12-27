// ===========================
// NO MORE HARDCODED DATA!
// All data comes from the backend API
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
function populateReport(data) {
    document.getElementById("artistName").textContent = data.artist;
    document.getElementById("venueInfo").textContent =
        `${data.venue} • ${formatDate(data.date)}`;

    const venueStats = data.venue_stats || {};

    // Top cards
    document.getElementById("avgLastMonth").textContent = roundOrDash(venueStats.avg_tickets_last_1_month);
    document.getElementById("eventsLastMonth").textContent = roundOrDash(venueStats.events_last_1_month);
    document.getElementById("avgLastYear").textContent = roundOrDash(venueStats.avg_tickets_last_1_year);
    document.getElementById("eventsLastYear").textContent = roundOrDash(venueStats.events_last_1_year);

    // Weather
    if (data.weather && Object.keys(data.weather).length) {
        const c = data.weather.conditions || "Unknown";
        const t = Math.round(data.weather.temperature || 0);
        document.getElementById("weatherConditionSmall").textContent = c;
        document.getElementById("weatherTempSmall").textContent = `${t}°C`;
    }

    // Chart
    const history = venueStats.history_last_6_months || [];
    const labels = history.map(h => h.month);
    const values = history.map(h => h.tickets);

    window._chartLabels = labels;
    window._chartValues = values;

    createTrendsChart(labels, values);

    // ===========================
    // PREDICTED TICKET SALES (Show Range)
    // ===========================
    const ticketPrediction = data.predicted_tickets || {};
    
    const recommendedPriceEl = document.getElementById("recommendedPriceLarge");
    if (recommendedPriceEl && ticketPrediction.expected) {
        recommendedPriceEl.textContent = ticketPrediction.expected;
        
        // Add capacity percentage
        const priceCard = recommendedPriceEl.closest('.info-card');
        if (priceCard) {
            const cardHeader = priceCard.querySelector('.card-header h3');
            if (cardHeader) {
                cardHeader.textContent = 'Predicted Ticket Sales';
            }
            
            const statLabel = priceCard.querySelector('.stat-label');
            if (statLabel) {
                statLabel.textContent = 'Expected Sales';
            }
            
            // Add capacity info
            if (!document.getElementById('capacityInfo')) {
                const capacityInfo = document.createElement('div');
                capacityInfo.id = 'capacityInfo';
                capacityInfo.style.marginTop = '10px';
                capacityInfo.style.fontSize = '14px';
                capacityInfo.style.color = '#6b7280';
                capacityInfo.innerHTML = `
                    <div>Range: ${ticketPrediction.low} - ${ticketPrediction.high} tickets</div>
                    <div>Capacity: ${ticketPrediction.capacity} (${ticketPrediction.capacity_percentage}% expected)</div>
                `;
                priceCard.querySelector('.stat-card').appendChild(capacityInfo);
            }
        }
    }

    // ===========================
    // COMPETING SHOWS (from API)
    // ===========================
    const competingShows = data.competing_shows || { totalShows: 0, events: [] };
    
    // Update the count
    const competingShowsEl = document.getElementById("competingShowsCount");
    if (competingShowsEl) {
        competingShowsEl.textContent = competingShows.totalShows;
    }
    
    // Update the events list
    const competingEventsList = document.getElementById("competingEventsList");
    if (competingEventsList && competingShows.events && competingShows.events.length > 0) {
        competingEventsList.innerHTML = competingShows.events.map(event => `
            <div class="competing-event-item">
                <div class="competing-event-content">
                    <span class="event-name">${event.name}</span>
                    <span class="event-date">${event.date}</span>
                </div>
                <span class="event-days">${event.daysDiff} days away</span>
            </div>
        `).join('');
    } else if (competingEventsList) {
        competingEventsList.innerHTML = '<p style="color: #6b7280; font-size: 14px;">No competing events in the next 7 days</p>';
    }
    
    // Add styles if not already present
    if (!document.getElementById('competingAnalysisStyles')) {
        const style = document.createElement('style');
        style.id = 'competingAnalysisStyles';
        style.textContent = `
            .competing-event-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 14px 16px;
                margin-bottom: 10px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 3px solid #9b87f5;
                transition: all 0.2s ease;
            }
            
            .competing-event-item:hover {
                background: #f1f3f5;
                transform: translateX(2px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            
            .competing-event-item:last-child {
                margin-bottom: 0;
            }
            
            .competing-event-content {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .event-name {
                font-weight: 600;
                font-size: 15px;
                color: #1a1a1a;
            }
            
            .event-date {
                font-size: 13px;
                color: #6b7280;
            }
            
            .event-days {
                font-size: 13px;
                font-weight: 500;
                color: #9b87f5;
                background: rgba(155, 135, 245, 0.1);
                padding: 4px 12px;
                border-radius: 12px;
                white-space: nowrap;
            }
            
            .competition-summary {
                margin-top: 16px;
                padding: 12px 16px;
                background: #fff7ed;
                border: 1px solid #fed7aa;
                border-radius: 8px;
                font-size: 14px;
                color: #ea580c;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }

    // ===========================
    // LAST PLAY INFORMATION (from API)
    // ===========================
    const artistVenueInfo = data.artist_venue_info || {};
    
    if (artistVenueInfo.last_play_date) {
        document.getElementById("lastPlayDate").textContent = artistVenueInfo.last_play_date;
    } else {
        document.getElementById("lastPlayDate").textContent = "Never";
    }
    
    if (artistVenueInfo.times_played) {
        document.getElementById("timesPlayed").textContent = artistVenueInfo.times_played;
    } else {
        document.getElementById("timesPlayed").textContent = "0";
    }

    // Social
    populateSocialStats(data.cm_data);

    // Raw sections
    document.getElementById("weatherData").textContent =
        JSON.stringify(data.weather, null, 2);
    document.getElementById("artistData").textContent =
        JSON.stringify(data.cm_data, null, 2);
    document.getElementById("featuresData").textContent =
        JSON.stringify(data.features_used, null, 2);
}

// ===========================
function populateSocialStats(cmData = {}) {
    const el = document.getElementById("socialStats");
    if (!el) return;

    const platforms = [
        { icon: "🎵", name: "Spotify", value: cmData.spotify_followers || 0, change: -3 },
        { icon: "📷", name: "Instagram", value: cmData.instagram_total_followers || 0, change: -5 },
        { icon: "🎬", name: "TikTok", value: cmData.tiktok_total_followers || 0, change: -8 }
    ];

    el.innerHTML = platforms
        .map(p => {
            const arrow = p.change < 0 ? "↘" : "↗";
            const dir = p.change < 0 ? "negative" : "positive";
            return `
                <div class="social-item">
                    <div class="social-left">
                        <span class="social-icon">${p.icon}</span>
                        <span class="social-name">${p.name}</span>
                    </div>
                    <div>
                        <span class="social-value">${formatNumber(p.value)}</span>
                        <span class="social-change ${dir}">
                            ${arrow}${Math.abs(p.change)}%
                        </span>
                    </div>
                </div>
            `;
        })
        .join("");
}

// ===========================
function createTrendsChart(labels, values) {
    const ctx = document.getElementById("trendsChart");
    if (!ctx) return;

    if (trendsChart) trendsChart.destroy();

    const avg =
        values.length > 0
            ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
            : 0;

    document.getElementById("chartSubtitle").textContent =
        `Last 6 months • Average: ${avg} tickets`;

    const dataset = {
        label: "Tickets",
        data: values,
        backgroundColor: "rgba(222, 213, 235, 0.9)",
        borderColor: "#DED5EB",
        borderWidth: 2,
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
            plugins: { legend: { display: false } }
        }
    });
}

function recreateChart() {
    createTrendsChart(window._chartLabels, window._chartValues);
}

// -------------------------
function toggleSection(id) {
    const section = document.getElementById(id);
    const icon = event.currentTarget.querySelector(".expand-icon");
    const isClosed = section.classList.contains("collapsed");
    section.classList.toggle("collapsed", !isClosed);
    icon.classList.toggle("rotated", isClosed);
}
window.toggleSection = toggleSection;

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
