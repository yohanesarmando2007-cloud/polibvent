// Base64 conversion function
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Debug function
function debugLog(message, data = null) {
    console.log(`[DEBUG] ${message}`, data || '');
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    debugLog("DOM Content Loaded - Public View");
    
    // Menu toggle for mobile
    const menuBar = document.querySelector(".menu-bar");
    const menuNav = document.querySelector(".menu");
    
    if (menuBar && menuNav) {
        debugLog("Menu elements found");
        menuBar.addEventListener("click", function() {
            debugLog("Menu bar clicked");
            menuNav.classList.toggle("menu-active");
        });
    }

    // Navbar scroll effect
    const navBar = document.querySelector(".navbar");
    if (navBar) {
        debugLog("Navbar found");
        window.addEventListener("scroll", function() {
            const windowPosition = window.scrollY > 0;
            navBar.classList.toggle("scrolling-active", windowPosition);
        });
    }

    // Search functionality
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        debugLog("Search input found");
        searchInput.addEventListener("input", searchEvent);
    }

    // Initialize modal functionality
    initializeModal();

    // Load events for public view
    loadEvents();
});

// Initialize modal functionality
function initializeModal() {
    const addEventModal = document.getElementById("addEventModal");
    const addEventForm = document.getElementById("addEventForm");
    const addEventBtn = document.getElementById("addEventBtn");
    const cancelAddEvent = document.getElementById("cancelAddEvent");

    debugLog("Modal elements", { 
        addEventModal: !!addEventModal,
        addEventForm: !!addEventForm,
        addEventBtn: !!addEventBtn,
        cancelAddEvent: !!cancelAddEvent
    });

    // Show add event modal
    if (addEventBtn && addEventModal) {
        addEventBtn.addEventListener("click", function() {
            debugLog("Add event button clicked");
            addEventModal.style.display = "flex";
        });
    }

    // Hide add event modal
    if (cancelAddEvent && addEventModal) {
        cancelAddEvent.addEventListener("click", function() {
            addEventModal.style.display = "none";
            if (addEventForm) addEventForm.reset();
            const posterPreview = document.getElementById("posterPreview");
            if (posterPreview) posterPreview.style.display = "none";
        });
    }

    // Preview image for add event form
    const posterInput = document.getElementById("poster");
    if (posterInput) {
        posterInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            const posterPreview = document.getElementById("posterPreview");
            if (file && posterPreview) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    posterPreview.src = e.target.result;
                    posterPreview.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Add event form submission
    if (addEventForm) {
        addEventForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            debugLog("Add event form submitted");
            
            await handleAddEventForm();
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('addEventModal');
        if (event.target === modal) {
            modal.style.display = 'none';
            const form = document.getElementById('addEventForm');
            if (form) form.reset();
            const posterPreview = document.getElementById('posterPreview');
            if (posterPreview) posterPreview.style.display = 'none';
        }
    });
}

// Handle add event form submission
async function handleAddEventForm() {
    const formData = new FormData(document.getElementById("addEventForm"));
    let posterData = "";
    
    try {
        // Convert image to base64 if provided
        const posterFile = formData.get("poster");
        if (posterFile && posterFile.size > 0) {
            debugLog("Processing poster file", posterFile.name);
            posterData = await toBase64(posterFile);
            debugLog("Poster converted to base64", { length: posterData.length });
        } else {
            // Default poster if no image uploaded
            posterData = "https://via.placeholder.com/300x200?text=Event+Poster";
            debugLog("Using default poster");
        }
        
        // Create new event object for database
        const newEvent = {
            title: formData.get("title"),
            description: formData.get("description"),
            start_date: formData.get("startDate"),
            end_date: formData.get("endDate"),
            start_time: formData.get("startTime"),
            end_time: formData.get("endTime"),
            location: formData.get("location"),
            poster_url: posterData,
            status: "Aktif",
            approval_status: "Menunggu"
        };

        debugLog("New event data", newEvent);
        
        // Try to save to database via API
        try {
            const response = await fetch('api_events.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEvent)
            });
            
            const result = await response.json();
            debugLog("API response", result);
            
            if (result.success) {
                // Reset form and close modal
                document.getElementById("addEventForm").reset();
                const posterPreview = document.getElementById("posterPreview");
                if (posterPreview) {
                    posterPreview.style.display = "none";
                }
                const addEventModal = document.getElementById("addEventModal");
                if (addEventModal) {
                    addEventModal.style.display = "none";
                }
                
                // Reload events
                loadEvents();
                
                alert("Event berhasil ditambahkan! Menunggu persetujuan admin.");
            } else {
                alert("Gagal menambahkan event. Silakan coba lagi.");
            }
        } catch (error) {
            console.error('Error adding event:', error);
            // Fallback to localStorage if API fails
            saveToLocalStorage(newEvent);
        }
    } catch (error) {
        console.error('Error in form handling:', error);
        alert("Terjadi kesalahan saat memproses form.");
    }
}

// Fallback function to save to localStorage if API fails
function saveToLocalStorage(eventData) {
    const eventId = Date.now();
    const newEvent = {
        id: eventId,
        // Database fields
        title: eventData.title,
        start_date: eventData.start_date,
        end_date: eventData.end_date,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        location: eventData.location,
        description: eventData.description,
        status: "Aktif",
        poster_url: eventData.poster_url,
        approval_status: "Menunggu",
        
        // Compatibility fields
        titleEvent: eventData.title,
        startDate: eventData.start_date,
        endDate: eventData.end_date,
        startTime: eventData.start_time,
        endTime: eventData.end_time,
        poster: eventData.poster_url,
        approval: "Menunggu"
    };
    
    const events = JSON.parse(localStorage.getItem("events")) || [];
    events.push(newEvent);
    localStorage.setItem("events", JSON.stringify(events));
    
    // Reset form and close modal
    const addEventForm = document.getElementById("addEventForm");
    const addEventModal = document.getElementById("addEventModal");
    const posterPreview = document.getElementById("posterPreview");
    
    if (addEventForm) addEventForm.reset();
    if (posterPreview) posterPreview.style.display = "none";
    if (addEventModal) addEventModal.style.display = "none";
    
    // Reload events
    loadEvents();
    
    alert("Event berhasil ditambahkan (offline mode)! Menunggu persetujuan admin.");
}

// Load events for public view - IMPROVED VERSION
async function loadEvents() {
    const container = document.getElementById("eventContainer");
    
    if (!container) {
        debugLog("Event container not found");
        return;
    }
    
    // Show loading state
    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #777;">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; margin-bottom: 20px;"></i>
            <h3>Memuat events...</h3>
        </div>
    `;
    
    try {
        // Try to load from database first
        debugLog("Loading events from database...");
        const response = await fetch('api_events.php');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const events = await response.json();
        debugLog("Events loaded from database", { count: events.length });
        
        // Filter only approved and active events for public view
        // Support both database and localStorage field names
        const approvedEvents = events.filter(event => {
            const isApproved = (event.approval_status === "Disetujui") || (event.approval === "Disetujui");
            const isActive = event.status === "Aktif";
            return isApproved && isActive;
        });
        
        debugLog("Approved events for public view", { 
            total: events.length, 
            approved: approvedEvents.length 
        });
        
        displayEvents(approvedEvents);
        
    } catch (error) {
        console.error('Error loading from database:', error);
        debugLog("Falling back to localStorage");
        // Fallback to localStorage
        loadEventsFromLocalStorage();
    }
}

// Fallback to localStorage - IMPROVED VERSION
function loadEventsFromLocalStorage() {
    debugLog("Loading events from localStorage");
    const events = JSON.parse(localStorage.getItem("events")) || [];
    
    // Debug: Tampilkan semua events
    console.log("All localStorage events:", events);
    
    // Filter events yang approved dan active - support both field names
    const approvedEvents = events.filter(event => {
        const isApproved = (event.approval_status === "Disetujui") || (event.approval === "Disetujui");
        const isActive = event.status === "Aktif";
        const hasRequiredFields = (event.title || event.titleEvent) && (event.poster_url || event.poster);
        
        return isApproved && isActive && hasRequiredFields;
    });
    
    debugLog("LocalStorage events", { 
        total: events.length, 
        approved: approvedEvents.length 
    });
    
    displayEvents(approvedEvents);
}

// Display events function
function displayEvents(events) {
    const container = document.getElementById("eventContainer");
    
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!events || events.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #777;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>Belum ada event yang tersedia</h3>
                <p>Silakan tambah event baru atau hubungi admin untuk persetujuan.</p>
            </div>
        `;
        return;
    }
    
    debugLog(`Displaying ${events.length} events`);
    
    events.forEach((event) => {
        const box = document.createElement("div");
        box.className = "box";
        
        // Use database field names with fallback to localStorage names
        const eventTitle = event.title || event.titleEvent || "Judul Event";
        const eventPoster = event.poster_url || event.poster || 'https://via.placeholder.com/300x200?text=No+Image';
        const eventDescription = event.description || "Deskripsi event tidak tersedia.";
        const eventStartDate = event.start_date || event.startDate;
        const eventEndDate = event.end_date || event.endDate;
        const eventStartTime = event.start_time || event.startTime || "00:00";
        const eventEndTime = event.end_time || event.endTime || "00:00";
        const eventLocation = event.location || "Lokasi tidak tersedia";
        const eventId = event.id;

        // Debug each event
        debugLog(`Event ${eventId}`, {
            title: eventTitle,
            poster: eventPoster?.substring(0, 50) + '...',
            hasPoster: !!eventPoster
        });
        
        box.innerHTML = `
            <img src="${eventPoster}" 
                 alt="Poster ${eventTitle}"
                 onerror="this.src='https://via.placeholder.com/300x200?text=Gambar+Error'"
                 style="width:100%; height:200px; object-fit:cover; border-radius:10px;">
            <h3>${eventTitle}</h3>
            <p>${eventDescription.substring(0, 100)}${eventDescription.length > 100 ? '...' : ''}</p>
            <p><i class="fas fa-calendar"></i> ${formatDate(eventStartDate)} - ${formatDate(eventEndDate)}</p>
            <p><i class="fas fa-clock"></i> ${eventStartTime} - ${eventEndTime}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${eventLocation}</p>
            <div class="button-group">
                <button class="btn-detail" onclick="viewEventDetail(${eventId})" 
                        style="width:100%; height:30px; border:none; background-color:#001BB7; color:white; font-weight:bold; border-radius:5px; cursor:pointer; transition:all 0.3s ease; margin-top:10px;">
                    Lihat Detail
                </button>
            </div>
        `;
        
        container.appendChild(box);
    });
}

// Search events
function searchEvent() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    
    const input = searchInput.value.toLowerCase().trim();
    const eventBoxes = document.querySelectorAll(".box-event .box");
    
    debugLog(`Searching for: "${input}"`, { totalBoxes: eventBoxes.length });
    
    let visibleCount = 0;
    
    eventBoxes.forEach((box) => {
        const title = box.querySelector("h3")?.textContent.toLowerCase() || "";
        const description = box.querySelector("p:nth-of-type(1)")?.textContent.toLowerCase() || "";
        const dateText = box.querySelector("p:nth-of-type(2)")?.textContent.toLowerCase() || "";
        const location = box.querySelector("p:nth-of-type(4)")?.textContent.toLowerCase() || "";
        
        const match =
            title.includes(input) ||
            description.includes(input) ||
            dateText.includes(input) ||
            location.includes(input);
        
        box.style.display = match ? "block" : "none";
        
        if (match) visibleCount++;
    });
    
    debugLog(`Search results: ${visibleCount} events found`);
    
    // Show no results message if no matches
    const container = document.getElementById("eventContainer");
    const noResults = container.querySelector(".no-results");
    
    if (visibleCount === 0 && input.length > 0) {
        if (!noResults) {
            const noResultsDiv = document.createElement("div");
            noResultsDiv.className = "no-results";
            noResultsDiv.style.cssText = "grid-column: 1 / -1; text-align: center; padding: 40px; color: #777;";
            noResultsDiv.innerHTML = `
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>Tidak ada event yang ditemukan</h3>
                <p>Coba kata kunci lain atau lihat semua event.</p>
            `;
            container.appendChild(noResultsDiv);
        }
    } else if (noResults) {
        noResults.remove();
    }
}

// View event detail
function viewEventDetail(id) {
    debugLog(`Viewing event detail: ${id}`);
    localStorage.setItem("selectedEventId", id);
    window.location.href = "detaileventm.html";
}

// Format date for display
function formatDate(dateStr) {
    if (!dateStr) return "-";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "-";
        
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return "-";
    }
}

// Utility function to check if element exists
function elementExists(selector) {
    return document.querySelector(selector) !== null;
}

// Debug function untuk cek data
function checkEventData() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    console.log("=== EVENT DATA DEBUG ===");
    console.log("Total events:", events.length);
    
    events.forEach((event, index) => {
        console.log(`Event ${index + 1}:`, {
            id: event.id,
            title: event.title || event.titleEvent,
            approval: event.approval_status || event.approval,
            status: event.status,
            hasPoster: !!(event.poster_url || event.poster)
        });
    });
    
    return events;
}

// Initialize debug info
debugLog("Script initialized", {
    page: "Public View",
    hasEventContainer: elementExists("#eventContainer"),
    hasAddEventBtn: elementExists("#addEventBtn"),
    timestamp: new Date().toISOString()
});