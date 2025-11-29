// Convert file to Base64
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
    console.log(`[DASHBOARD] ${message}`, data || '');
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    debugLog("DOM Content Loaded - Admin Dashboard");
    
    const tableBody = document.getElementById("eventTable");
    const searchInput = document.getElementById("searchInput");

    let editModal;
    let formEdit;

    // Create edit modal
    function createEditModal() {
        debugLog("Creating edit modal");
        
        const modal = document.createElement("div");
        modal.id = "editModal";
        modal.style.cssText = `
            display:none;
            position:fixed;
            inset:0;
            background:rgba(0,0,0,0.5);
            justify-content:center;
            align-items:center;
            z-index:1000;
        `;

        modal.innerHTML = `
            <div style="
                background:#fff;
                padding:20px;
                border-radius:8px;
                width:100%;
                max-width:500px;
                max-height:90vh;
                overflow-y:auto;
                box-sizing:border-box;
            ">
                <h3 style="margin-top:0; color:#1e40af;">Edit Event</h3>
                <form id="formEdit">
                    <input type="hidden" name="idEvent">

                    <div style="margin-bottom:15px;">
                        <label style="display:block; font-weight:bold; margin-bottom:5px;">Judul:</label>
                        <input type="text" name="title" required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                    </div>

                    <div style="margin-bottom:15px;">
                        <label style="display:block; font-weight:bold; margin-bottom:5px;">Upload Poster:</label>
                        <input type="file" name="posterFile" accept="image/*" style="width:100%;">
                        <img id="previewPoster" src="" style="width:100%; max-height:150px; margin-top:10px; border-radius:4px; display:none;">
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                        <div>
                            <label style="display:block; font-weight:bold; margin-bottom:5px;">Tanggal Mulai:</label>
                            <input type="date" name="dateStart" required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                        </div>
                        <div>
                            <label style="display:block; font-weight:bold; margin-bottom:5px;">Tanggal Selesai:</label>
                            <input type="date" name="dateEnd" required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                        <div>
                            <label style="display:block; font-weight:bold; margin-bottom:5px;">Waktu Mulai:</label>
                            <input type="time" name="timeStart" required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                        </div>
                        <div>
                            <label style="display:block; font-weight:bold; margin-bottom:5px;">Waktu Selesai:</label>
                            <input type="time" name="timeEnd" required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                        </div>
                    </div>

                    <div style="margin-bottom:15px;">
                        <label style="display:block; font-weight:bold; margin-bottom:5px;">Lokasi:</label>
                        <input type="text" name="location" required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                    </div>

                    <div style="margin-bottom:15px;">
                        <label style="display:block; font-weight:bold; margin-bottom:5px;">Deskripsi:</label>
                        <textarea name="description" rows="4" required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;"></textarea>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                        <div>
                            <label style="display:block; font-weight:bold; margin-bottom:5px;">Status:</label>
                            <select name="status" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                                <option value="Aktif">Aktif</option>
                                <option value="Nonaktif">Nonaktif</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-weight:bold; margin-bottom:5px;">Persetujuan:</label>
                            <select name="approval_status" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                                <option value="Menunggu">Menunggu</option>
                                <option value="Disetujui">Disetujui</option>
                                <option value="Ditolak">Ditolak</option>
                            </select>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button type="submit" style="background:#2563eb; color:white; padding:10px 20px; border:none; border-radius:4px; cursor:pointer;">Simpan</button>
                        <button type="button" id="closeModal" style="background:#6b7280; color:white; padding:10px 20px; border:none; border-radius:4px; cursor:pointer;">Batal</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        editModal = modal;
        formEdit = modal.querySelector("#formEdit");

        // Close modal handler
        modal.querySelector("#closeModal").addEventListener("click", () => {
            modal.style.display = "none";
        });

        // Image preview handler
        formEdit.posterFile.addEventListener("change", () => {
            const file = formEdit.posterFile.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const preview = document.getElementById("previewPoster");
                    preview.src = reader.result;
                    preview.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });

        // Form submit handler
        formEdit.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = formEdit.idEvent.value;
            
            debugLog(`Updating event: ${id}`);
            
            let posterData = document.getElementById("previewPoster").src;

            // Handle new poster upload
            if (formEdit.posterFile.files[0]) {
                debugLog("Processing new poster upload");
                posterData = await toBase64(formEdit.posterFile.files[0]);
            }

            // Update event data for database
            const updatedEvent = {
                id: id,
                title: formEdit.title.value,
                description: formEdit.description.value,
                start_date: formEdit.dateStart.value,
                end_date: formEdit.dateEnd.value,
                start_time: formEdit.timeStart.value,
                end_time: formEdit.timeEnd.value,
                location: formEdit.location.value,
                poster_url: posterData,
                status: formEdit.status.value,
                approval_status: formEdit.approval_status.value
            };

            debugLog("Updated event data", updatedEvent);

            try {
                // Update to database via API
                const response = await fetch('api_events.php', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedEvent)
                });

                const result = await response.json();
                debugLog("Update API response", result);
                
                if (result.success) {
                    editModal.style.display = "none";
                    loadEvents();
                    alert("Event berhasil diupdate!");
                } else {
                    alert("Gagal mengupdate event. Silakan coba lagi.");
                }
            } catch (error) {
                console.error('Error updating event:', error);
                // Fallback to localStorage
                updateEventInLocalStorage(updatedEvent);
            }
        });
    }

    // Fallback function for localStorage
    function updateEventInLocalStorage(eventData) {
        let events = JSON.parse(localStorage.getItem("events")) || [];
        const index = events.findIndex(ev => ev.id == eventData.id);

        if (index !== -1) {
            events[index] = {
                ...events[index],
                id: eventData.id,
                titleEvent: eventData.title,
                poster: eventData.poster_url,
                startDate: eventData.start_date,
                endDate: eventData.end_date,
                startTime: eventData.start_time,
                endTime: eventData.end_time,
                location: eventData.location,
                description: eventData.description,
                status: eventData.status,
                approval: eventData.approval_status,
                // Keep database fields for compatibility
                title: eventData.title,
                start_date: eventData.start_date,
                end_date: eventData.end_date,
                start_time: eventData.start_time,
                end_time: eventData.end_time,
                poster_url: eventData.poster_url,
                approval_status: eventData.approval_status
            };

            localStorage.setItem("events", JSON.stringify(events));
            editModal.style.display = "none";
            loadEvents();
            alert("Event berhasil diupdate (offline mode)!");
        }
    }

    // Open edit modal with event data
    function openEditModal(eventData) {
        debugLog(`Opening edit modal for event: ${eventData.id}`);
        editModal.style.display = "flex";

        // Populate form fields - handle both database and localStorage structures
        formEdit.idEvent.value = eventData.id;
        formEdit.title.value = eventData.title || eventData.titleEvent || "";
        formEdit.dateStart.value = eventData.start_date || eventData.startDate || "";
        formEdit.dateEnd.value = eventData.end_date || eventData.endDate || "";
        formEdit.timeStart.value = eventData.start_time || eventData.startTime || "";
        formEdit.timeEnd.value = eventData.end_time || eventData.endTime || "";
        formEdit.location.value = eventData.location || "";
        formEdit.description.value = eventData.description || "";
        formEdit.status.value = eventData.status || "Aktif";
        formEdit.approval_status.value = eventData.approval_status || eventData.approval || "Menunggu";

        // Set poster preview
        const posterSrc = eventData.poster_url || eventData.poster;
        const previewPoster = document.getElementById("previewPoster");
        if (posterSrc && posterSrc !== "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='%23eef2ff'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2303496a' font-size='11'>Preview</text></svg>") {
            previewPoster.src = posterSrc;
            previewPoster.style.display = "block";
        } else {
            previewPoster.style.display = "none";
        }
    }

    // Load events to table - IMPROVED VERSION
    async function loadEvents() {
        debugLog("Loading events for dashboard");
        
        // Show loading state
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:20px; color:#777;">
                    <i class="fas fa-spinner fa-spin"></i> Memuat events...
                </td>
            </tr>
        `;

        try {
            // Try to load from database first
            const response = await fetch('api_events.php');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const events = await response.json();
            debugLog("Events loaded from database", { count: events.length });
            
            displayEventsInTable(events);
            
        } catch (error) {
            console.error('Error loading from database:', error);
            debugLog("Falling back to localStorage");
            // Fallback to localStorage
            loadEventsFromLocalStorage();
        }
    }

    // Fallback: Load events from localStorage - IMPROVED VERSION
    function loadEventsFromLocalStorage() {
        debugLog("Loading events from localStorage");
        const events = JSON.parse(localStorage.getItem("events")) || [];
        
        // Debug: Tampilkan semua events di console
        console.log("All events in localStorage:", events);
        
        // Filter events yang memiliki struktur yang benar
        const validEvents = events.filter(event => {
            const hasTitle = event.title || event.titleEvent;
            const hasDate = event.start_date || event.startDate;
            return hasTitle && hasDate;
        });
        
        debugLog("Valid events found", { 
            total: events.length, 
            valid: validEvents.length,
            invalid: events.length - validEvents.length
        });
        
        // Tampilkan events yang invalid untuk debugging
        const invalidEvents = events.filter(event => !(event.title || event.titleEvent));
        if (invalidEvents.length > 0) {
            console.warn("Invalid events found:", invalidEvents);
        }
        
        displayEventsInTable(validEvents);
    }

    // Display events in table - IMPROVED VERSION
    function displayEventsInTable(events) {
        debugLog(`Displaying ${events?.length || 0} events in table`);
        tableBody.innerHTML = "";

        if (!events || events.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center; padding:40px; color:#777;">
                        <i class="fas fa-calendar-times" style="font-size:2rem; margin-bottom:10px; display:block;"></i>
                        Belum ada event
                    </td>
                </tr>
            `;
            return;
        }

        events.forEach((event, index) => {
            const row = document.createElement("tr");

            // Handle both database and localStorage field names
            const eventTitle = event.title || event.titleEvent || "Judul Tidak Ditemukan";
            const eventPoster = event.poster_url || event.poster || 'https://via.placeholder.com/80x60?text=No+Image';
            const eventStartDate = event.start_date || event.startDate;
            const eventEndDate = event.end_date || event.endDate;
            const eventStartTime = event.start_time || event.startTime || "00:00";
            const eventEndTime = event.end_time || event.endTime || "00:00";
            const eventLocation = event.location || "Lokasi tidak tersedia";
            const eventStatus = event.status || "Aktif";
            const eventApproval = event.approval_status || event.approval || "Menunggu";
            const eventId = event.id;

            debugLog(`Event ${eventId}`, {
                title: eventTitle,
                poster: eventPoster?.substring(0, 50) + '...',
                approval: eventApproval
            });

            let approveUI = "";

            // UI untuk kolom persetujuan
            if (eventApproval === "Disetujui") {
                approveUI = `<span style="color:green; font-weight:bold;">✔ Disetujui</span>`;
            } else if (eventApproval === "Ditolak") {
                approveUI = `<span style="color:red; font-weight:bold;">✖ Ditolak</span>`;
            } else {
                approveUI = `
                    <button class="btn-approve" data-id="${eventId}" 
                            style="background:green;color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer; margin-right:5px;">
                        Setujui
                    </button>
                    <button class="btn-reject" data-id="${eventId}" 
                            style="background:red;color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer;">
                        Tolak
                    </button>
                `;
            }

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <img src="${eventPoster}" 
                         alt="Poster"
                         onerror="this.src='https://via.placeholder.com/80x60?text=No+Image'"
                         style="width:80px; height:60px; border-radius:6px; object-fit:cover;">
                </td>
                <td><strong>${eventTitle}</strong></td>
                <td>${formatDate(eventStartDate)} - ${formatDate(eventEndDate)}</td>
                <td>${eventStartTime} - ${eventEndTime}</td>
                <td>${eventLocation}</td>
                <td>
                    <span style="color:${eventStatus === "Aktif" ? "green" : "red"}; font-weight:bold;">
                        ${eventStatus}
                    </span>
                </td>
                <td>${approveUI}</td>
                <td>
                    <button class="btn-edit" data-id="${eventId}" 
                            style="background:#3b82f6;color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer; margin-right:5px;">
                        Edit
                    </button>
                    <button class="btn-delete" data-id="${eventId}" 
                            style="background:#dc2626;color:white; padding:5px 10px; border:none; border-radius:4px; cursor:pointer;">
                        Hapus
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Format date to DD/MM/YYYY
    function formatDate(dateStr) {
        if (!dateStr) return "-";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "-";
            
            return `${String(date.getDate()).padStart(2, "0")}/${String(
                date.getMonth() + 1
            ).padStart(2, "0")}/${date.getFullYear()}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return "-";
        }
    }

    // Search events
    function searchEvent() {
        const keyword = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll("#eventTable tr");

        debugLog(`Searching for: "${keyword}"`, { totalRows: rows.length });

        let visibleCount = 0;

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            const isVisible = text.includes(keyword);
            row.style.display = isVisible ? "" : "none";
            
            if (isVisible) visibleCount++;
        });

        debugLog(`Search results: ${visibleCount} events found`);
    }

    // Table event delegation
    tableBody.addEventListener("click", async (e) => {
        // DELETE event
        if (e.target.classList.contains("btn-delete")) {
            const id = e.target.dataset.id;
            if (confirm("Yakin ingin menghapus event?")) {
                debugLog(`Deleting event: ${id}`);
                try {
                    // Delete from database via API
                    const response = await fetch('api_events.php', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id: id })
                    });

                    const result = await response.json();
                    debugLog("Delete API response", result);
                    
                    if (result.success) {
                        loadEvents();
                        alert("Event berhasil dihapus!");
                    } else {
                        alert("Gagal menghapus event. Silakan coba lagi.");
                    }
                } catch (error) {
                    console.error('Error deleting event:', error);
                    // Fallback to localStorage
                    deleteEventFromLocalStorage(id);
                }
            }
        }

        // EDIT event
        if (e.target.classList.contains("btn-edit")) {
            const id = e.target.dataset.id;
            debugLog(`Editing event: ${id}`);
            try {
                // Get event from database
                const response = await fetch(`api_events.php?id=${id}`);
                const event = await response.json();
                
                if (event) {
                    openEditModal(event);
                } else {
                    throw new Error("Event not found");
                }
            } catch (error) {
                console.error('Error loading event:', error);
                // Fallback to localStorage
                const events = JSON.parse(localStorage.getItem("events")) || [];
                const event = events.find(ev => ev.id == id);
                if (event) {
                    openEditModal(event);
                } else {
                    alert("Event tidak ditemukan!");
                }
            }
        }

        // APPROVE event
        if (e.target.classList.contains("btn-approve")) {
            const id = e.target.dataset.id;
            debugLog(`Approving event: ${id}`);
            
            try {
                // Get event first
                const response = await fetch(`api_events.php?id=${id}`);
                const event = await response.json();
                
                if (event) {
                    // Update approval status
                    const updatedEvent = {
                        ...event,
                        approval_status: "Disetujui"
                    };

                    const updateResponse = await fetch('api_events.php', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedEvent)
                    });

                    const result = await updateResponse.json();
                    debugLog("Approve API response", result);
                    
                    if (result.success) {
                        loadEvents();
                        alert("Event berhasil disetujui!");
                    } else {
                        alert("Gagal menyetujui event.");
                    }
                }
            } catch (error) {
                console.error('Error approving event:', error);
                // Fallback to localStorage
                approveEventInLocalStorage(id);
            }
        }

        // REJECT event
        if (e.target.classList.contains("btn-reject")) {
            const id = e.target.dataset.id;
            debugLog(`Rejecting event: ${id}`);
            
            try {
                // Get event first
                const response = await fetch(`api_events.php?id=${id}`);
                const event = await response.json();
                
                if (event) {
                    // Update approval status
                    const updatedEvent = {
                        ...event,
                        approval_status: "Ditolak"
                    };

                    const updateResponse = await fetch('api_events.php', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedEvent)
                    });

                    const result = await updateResponse.json();
                    debugLog("Reject API response", result);
                    
                    if (result.success) {
                        loadEvents();
                        alert("Event berhasil ditolak!");
                    } else {
                        alert("Gagal menolak event.");
                    }
                }
            } catch (error) {
                console.error('Error rejecting event:', error);
                // Fallback to localStorage
                rejectEventInLocalStorage(id);
            }
        }
    });

    // Fallback functions for localStorage
    function deleteEventFromLocalStorage(id) {
        let events = JSON.parse(localStorage.getItem("events")) || [];
        events = events.filter(ev => ev.id != id);
        localStorage.setItem("events", JSON.stringify(events));
        loadEvents();
        alert("Event berhasil dihapus (offline mode)!");
    }

    function approveEventInLocalStorage(id) {
        let events = JSON.parse(localStorage.getItem("events")) || [];
        const event = events.find(ev => ev.id == id);
        if (event) {
            event.approval = "Disetujui";
            event.approval_status = "Disetujui";
            localStorage.setItem("events", JSON.stringify(events));
            loadEvents();
            alert("Event berhasil disetujui (offline mode)!");
        }
    }

    function rejectEventInLocalStorage(id) {
        let events = JSON.parse(localStorage.getItem("events")) || [];
        const event = events.find(ev => ev.id == id);
        if (event) {
            event.approval = "Ditolak";
            event.approval_status = "Ditolak";
            localStorage.setItem("events", JSON.stringify(events));
            loadEvents();
            alert("Event berhasil ditolak (offline mode)!");
        }
    }

    // Search input event listener
    if (searchInput) {
        searchInput.addEventListener("input", searchEvent);
    }

    // Initialize
    createEditModal();
    loadEvents();
    
    debugLog("Dashboard initialized", {
        hasTableBody: !!tableBody,
        hasSearchInput: !!searchInput,
        timestamp: new Date().toISOString()
    });
});

// Global search function for button click
function searchEvent() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        const event = new Event('input');
        searchInput.dispatchEvent(event);
    }
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