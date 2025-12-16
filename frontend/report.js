// ===========================
// HARD-CODED ARTIST-VENUE LAST PLAY DATA
// ===========================
const HARDCODED_ARTIST_VENUE = [
    {
        Artist: "Still Woozy",
        Venue: "9:30 Club",
        last_play_date: "2022-02-01",
        times_played: 1
    },
    {
        Artist: "Pigeons Playing Ping Pong",
        Venue: "9:30 Club",
        last_play_date: "2024-12-14",
        times_played: 3
    },
    {
        Artist: "Dinosaur Jr.",
        Venue: "9:30 Club",
        last_play_date: "2021-11-16",
        times_played: 1
    },
    {
        Artist: "Role Model",
        Venue: "9:30 Club",
        last_play_date: "2025-03-12",
        times_played: 3
    },
    {
        Artist: "Ani DiFranco",
        Venue: "9:30 Club",
        last_play_date: "2025-04-16",
        times_played: 2
    },
    {
        Artist: "Ani DiFranco",
        Venue: "Carolina Theatre",
        last_play_date: "2025-03-14",
        times_played: 2
    },
    {
        Artist: "Ari Hest",
        Venue: "The Spot on Kirk",
        last_play_date: "2025-03-28",
        times_played: 3
    },
    {
        Artist: "Arlo Parks",
        Venue: "9:30 Club",
        last_play_date: "2024-03-23",
        times_played: 3
    },
    {
        Artist: "Brian Culbertson",
        Venue: "Carolina Theatre",
        last_play_date: "2023-11-14",
        times_played: 2
    },
    {
        Artist: "Buddy Holly",
        Venue: "Bright Box Theater",
        last_play_date: "2025-04-18",
        times_played: 3
    },
    {
        Artist: "Chris Botti",
        Venue: "Carolina Theatre",
        last_play_date: "2024-10-04",
        times_played: 3
    },
    {
        Artist: "GWAR",
        Venue: "9:30 Club",
        last_play_date: "2024-06-09",
        times_played: 3
    }
];

// ===========================
// HARD-CODED COMPETITION EVENTS (DATE + VENUE + EVENT COUNT)
// ===========================
const COMPETITION_EVENTS = [
    // 9:30 Club
    { date: "2025-12-31", venue: "9:30 Club", event_count: 8 },
    { date: "2025-12-30", venue: "9:30 Club", event_count: 3 },
    { date: "2025-12-29", venue: "9:30 Club", event_count: 1 },
    { date: "2025-12-28", venue: "9:30 Club", event_count: 2 },
    { date: "2025-12-27", venue: "9:30 Club", event_count: 7 },
    { date: "2025-12-26", venue: "9:30 Club", event_count: 1 },
    { date: "2025-12-22", venue: "9:30 Club", event_count: 3 },
    { date: "2025-12-21", venue: "9:30 Club", event_count: 5 },
    { date: "2025-12-20", venue: "9:30 Club", event_count: 7 },
    { date: "2025-12-19", venue: "9:30 Club", event_count: 8 },
    { date: "2025-12-18", venue: "9:30 Club", event_count: 7 },
    { date: "2025-12-17", venue: "9:30 Club", event_count: 3 },
    { date: "2025-12-16", venue: "9:30 Club", event_count: 8 },
    { date: "2025-12-15", venue: "9:30 Club", event_count: 1 },
    { date: "2025-12-14", venue: "9:30 Club", event_count: 11 },
    { date: "2025-12-13", venue: "9:30 Club", event_count: 9 },
    { date: "2025-12-12", venue: "9:30 Club", event_count: 13 },
    { date: "2025-12-11", venue: "9:30 Club", event_count: 11 },
    { date: "2025-12-10", venue: "9:30 Club", event_count: 7 },
    { date: "2025-12-09", venue: "9:30 Club", event_count: 6 },
    { date: "2025-12-08", venue: "9:30 Club", event_count: 6 },
    { date: "2025-12-07", venue: "9:30 Club", event_count: 5 },
    { date: "2025-12-06", venue: "9:30 Club", event_count: 16 },
    { date: "2025-12-05", venue: "9:30 Club", event_count: 15 },
    { date: "2025-12-04", venue: "9:30 Club", event_count: 11 },
    { date: "2025-12-03", venue: "9:30 Club", event_count: 9 },
    { date: "2025-12-02", venue: "9:30 Club", event_count: 7 },
    { date: "2025-12-01", venue: "9:30 Club", event_count: 2 },
    
    // Bright Box Theater
    { date: "2026-04-18", venue: "Bright Box Theater", event_count: 1 },
    { date: "2026-02-06", venue: "Bright Box Theater", event_count: 1 },
    { date: "2026-01-10", venue: "Bright Box Theater", event_count: 1 },
    { date: "2025-12-31", venue: "Bright Box Theater", event_count: 1 },
    { date: "2025-12-13", venue: "Bright Box Theater", event_count: 1 },
    { date: "2025-12-12", venue: "Bright Box Theater", event_count: 2 },
    { date: "2025-12-09", venue: "Bright Box Theater", event_count: 1 },
    { date: "2025-12-06", venue: "Bright Box Theater", event_count: 1 },
    { date: "2025-12-05", venue: "Bright Box Theater", event_count: 3 },
    
    // Carolina Theatre (selecting 30 dates)
    { date: "2026-09-20", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-08-22", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-08-21", venue: "Carolina Theatre", event_count: 2 },
    { date: "2026-08-14", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-07-29", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-07-16", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-06-13", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-06-04", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-06-02", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-05-22", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-05-19", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-05-09", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-04-23", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-04-19", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-04-18", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-04-17", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-04-12", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-04-11", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-04-10", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-04-09", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-03-27", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-03-25", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-03-22", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-03-21", venue: "Carolina Theatre", event_count: 2 },
    { date: "2026-03-20", venue: "Carolina Theatre", event_count: 2 },
    { date: "2026-03-18", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-03-17", venue: "Carolina Theatre", event_count: 2 },
    { date: "2026-03-16", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-03-07", venue: "Carolina Theatre", event_count: 1 },
    { date: "2026-03-06", venue: "Carolina Theatre", event_count: 1 },
    
    // The Spot on Kirk (selecting 30 dates)
    { date: "2026-06-12", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-06-04", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-04-23", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-04-21", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-04-10", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-03-21", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-03-06", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-03-01", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-02-27", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-02-26", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-02-20", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-02-07", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-02-05", venue: "The Spot on Kirk", event_count: 2 },
    { date: "2026-02-04", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-01-31", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-01-27", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-01-23", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2026-01-16", venue: "The Spot on Kirk", event_count: 2 },
    { date: "2026-01-10", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2025-12-31", venue: "The Spot on Kirk", event_count: 2 },
    { date: "2025-12-27", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2025-12-20", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2025-12-19", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2025-12-17", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2025-12-13", venue: "The Spot on Kirk", event_count: 2 },
    { date: "2025-12-12", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2025-12-10", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2025-12-07", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2025-12-06", venue: "The Spot on Kirk", event_count: 1 },
    { date: "2025-12-05", venue: "The Spot on Kirk", event_count: 3 }
];

// Pool of event names to randomly assign
const EVENT_NAMES = [
    "Main Stage", "Arena Plus", "The Ritz", "Underground", "Indie Showcase",
    "Rock Night", "Jazz Session", "Electronic Beat", "Acoustic Evening", "Hip Hop Live",
    "Metal Mayhem", "Pop Extravaganza", "Country Roads", "Blues Revival", "Folk Festival",
    "Latin Night", "R&B Lounge", "Punk Rock Show", "Classical Concert", "Comedy Special",
    "DJ Night", "Open Mic", "Tribute Night", "Album Release", "Battle of Bands"
];

// Track recently used event combinations to ensure variety
let recentEventHistory = [];

// Calculate competing shows within 7 days and generate event names
function getCompetingShowsAnalysis(venue, targetDateStr) {
    const targetDate = new Date(targetDateStr);
    const venueEvents = COMPETITION_EVENTS.filter(e => e.venue === venue);
    
    if (venueEvents.length === 0) {
        return { totalShows: 0, events: [] };
    }
    
    // Find all events within 7 days (3 days before, same day, 3 days after)
    const competingEvents = [];
    
    venueEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const daysDiff = Math.abs((eventDate - targetDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) {
            competingEvents.push({
                date: event.date,
                event_count: event.event_count,
                daysDiff: Math.round(daysDiff)
            });
        }
    });
    
    // Calculate total competing shows
    const totalShows = competingEvents.reduce((sum, e) => sum + e.event_count, 0);
    
    // Pick 2 random events to display (avoiding recently shown combinations)
    const selectedEvents = selectRandomEvents(competingEvents, venue, targetDateStr);
    
    return {
        totalShows,
        events: selectedEvents
    };
}

// Select 2 random events, ensuring variety across queries
function selectRandomEvents(competingEvents, venue, targetDate) {
    if (competingEvents.length === 0) return [];
    
    // Flatten all events with their individual shows
    const allShows = [];
    competingEvents.forEach(event => {
        for (let i = 0; i < event.event_count; i++) {
            allShows.push({
                date: event.date,
                daysDiff: event.daysDiff
            });
        }
    });
    
    if (allShows.length === 0) return [];
    
    // Create a unique key for this query
    const queryKey = `${venue}_${targetDate}`;
    
    // Get or initialize recent history for this query
    if (!recentEventHistory[queryKey]) {
        recentEventHistory[queryKey] = [];
    }
    
    // Get available event names (excluding recently used ones)
    let availableNames = EVENT_NAMES.filter(name => 
        !recentEventHistory[queryKey].includes(name)
    );
    
    // If we've used all names, reset
    if (availableNames.length < 2) {
        recentEventHistory[queryKey] = [];
        availableNames = [...EVENT_NAMES];
    }
    
    // Shuffle and pick 2 random shows
    const shuffledShows = allShows.sort(() => Math.random() - 0.5);
    const selectedShows = shuffledShows.slice(0, Math.min(2, allShows.length));
    
    // Assign random event names
    const result = selectedShows.map((show, index) => {
        const randomIndex = Math.floor(Math.random() * availableNames.length);
        const eventName = availableNames[randomIndex];
        
        // Remove from available pool and track usage
        availableNames.splice(randomIndex, 1);
        recentEventHistory[queryKey].push(eventName);
        
        // Keep only last 7 event names in history
        if (recentEventHistory[queryKey].length > 7) {
            recentEventHistory[queryKey].shift();
        }
        
        return {
            name: eventName,
            date: show.date,
            daysDiff: show.daysDiff
        };
    });
    
    return result;
}

// ===========================
// LOAD ARTIST–VENUE JSON
// ===========================
let ARTIST_VENUE_STATS = [];

async function loadArtistVenueStats() {
    try {
        const res = await fetch("../backend/data/artist_venue_last_play.json");
        ARTIST_VENUE_STATS = await res.json();
    } catch (e) {
        console.error("Failed to load artist_venue_last_play.json", e);
    }
}

// Lookup helper - checks hardcoded data first, then JSON
function getArtistVenueInfo(artist, venue) {
    // First, check hardcoded data
    const hardcoded = HARDCODED_ARTIST_VENUE.find(
        row => row.Artist === artist && row.Venue === venue
    );
    
    if (hardcoded) {
        return hardcoded;
    }
    
    // Fall back to JSON data
    return ARTIST_VENUE_STATS.find(
        row => row.Artist === artist && row.Venue === venue
    );
}

// ===========================
// HARD-CODED VENUE STATS
// (Only used for top cards + charts, NOT last play info anymore)
// ===========================
const VENUE_STATS = {
    "The Spot on Kirk": {
        capacity: 125,
        last_play_date: "2025-09-27",
        avg_tickets_last_1_month: 38,
        events_last_1_month: 8,
        avg_tickets_last_1_year: 46.69,
        events_last_1_year: 87,
        history_last_6_months: [
            { month: "Apr", tickets: 370 },
            { month: "May", tickets: 462 },
            { month: "Jun", tickets: 373 },
            { month: "Jul", tickets: 304 },
            { month: "Aug", tickets: 214 },
            { month: "Sep", tickets: 304 }
        ]
    },

    "Bright Box Theater": {
        capacity: 300,
        last_play_date: "2025-08-16",
        avg_tickets_last_1_month: 59.57,
        events_last_1_month: 7,
        avg_tickets_last_1_year: 84.98,
        events_last_1_year: 98,
        history_last_6_months: [
            { month: "Mar", tickets: 876 },
            { month: "Apr", tickets: 555 },
            { month: "May", tickets: 678 },
            { month: "Jun", tickets: 814 },
            { month: "Jul", tickets: 402 },
            { month: "Aug", tickets: 143 }
        ]
    },

    "Carolina Theatre": {
        capacity: 1055,
        last_play_date: "2025-10-01",
        avg_tickets_last_1_month: 519.67,
        events_last_1_month: 6,
        avg_tickets_last_1_year: 707.64,
        events_last_1_year: 42,
        history_last_6_months: [
            { month: "May", tickets: 2485 },
            { month: "Jun", tickets: 819 },
            { month: "Jul", tickets: 736 },
            { month: "Aug", tickets: 2363 },
            { month: "Sep", tickets: 2111 },
            { month: "Oct", tickets: 1007 }
        ]
    },

    "9:30 Club": {
        capacity: 1200,
        last_play_date: "2025-09-28",
        avg_tickets_last_1_month: 966,
        events_last_1_month: 17,
        avg_tickets_last_1_year: 907.82,
        events_last_1_year: 241,
        history_last_6_months: [
            { month: "Apr", tickets: 24031 },
            { month: "May", tickets: 26843 },
            { month: "Jun", tickets: 21093 },
            { month: "Jul", tickets: 8428 },
            { month: "Aug", tickets: 9262 },
            { month: "Sep", tickets: 15843 }
        ]
    },

    "Millwald Theatre": {
        capacity: 500,
        last_play_date: "2025-09-21",
        avg_tickets_last_1_month: 0,
        events_last_1_month: 4,
        avg_tickets_last_1_year: 131.26,
        events_last_1_year: 34,
        history_last_6_months: [
            { month: "Apr", tickets: 767 },
            { month: "May", tickets: 839 },
            { month: "Jun", tickets: 125 },
            { month: "Jul", tickets: 0 },
            { month: "Aug", tickets: 0 },
            { month: "Sep", tickets: 0 }
        ]
    }
};

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
    await loadArtistVenueStats();

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

    const venueStats = VENUE_STATS[data.venue];

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
    const history = venueStats.history_last_6_months;
    const labels = history.map(h => h.month);
    const values = history.map(h => h.tickets);

    window._chartLabels = labels;
    window._chartValues = values;

    createTrendsChart(labels, values);

    // Expected Sales
    const min = venueStats.capacity * 0.50;
    const max = venueStats.capacity * 0.65;
    const expected = Math.round(min + Math.random() * (max - min));
    document.getElementById("expectedSales").textContent = expected;

    // ===========================
    // COMPETING SHOWS ANALYSIS - Dynamic calculation
    // ===========================
    const competingAnalysis = getCompetingShowsAnalysis(data.venue, data.date);
    
    // Update the yellow box number
    const competingShowsEl = document.getElementById("competingShowsCount");
    if (competingShowsEl) {
        competingShowsEl.textContent = competingAnalysis.totalShows;
    }
    
    // Update the competing events list (show 2 random events)
    const competingEventsList = document.getElementById("competingEventsList");
    if (competingEventsList && competingAnalysis.events.length > 0) {
        competingEventsList.innerHTML = competingAnalysis.events.map(event => `
            <div class="competing-event-item">
                <div class="competing-event-content">
                    <span class="event-name">${event.name}</span>
                    <span class="event-date">${event.date}</span>
                </div>
                <span class="event-days">${event.daysDiff} days away</span>
            </div>
        `).join('');
    }
    
    // Add styles dynamically if not already present
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
            
            /* Improve the warning box styling */
            .competition-warning {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: #fff7ed;
                border: 1px solid #fed7aa;
                border-radius: 8px;
                margin-top: 16px;
                font-size: 14px;
                color: #ea580c;
            }
            
            .competition-warning-icon {
                font-size: 18px;
            }
            
            .competition-warning-text {
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }

    // ===========================
    // LAST PLAY INFORMATION: checks hardcoded first, then JSON
    // ===========================
    const avInfo = getArtistVenueInfo(data.artist, data.venue);

    if (avInfo) {
        document.getElementById("lastPlayDate").textContent = avInfo.last_play_date;
        document.getElementById("timesPlayed").textContent = avInfo.times_played;
    } else {
        document.getElementById("lastPlayDate").textContent = "-";
        document.getElementById("timesPlayed").textContent = "-";
    }

    // Recommended price
    document.getElementById("recommendedPriceLarge").textContent =
        `$${(data.recommended_price || 0).toFixed(2)}`;

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



