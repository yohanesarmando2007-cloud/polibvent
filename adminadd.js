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
    console.log(`[ADMIN ADD] ${message}`, data || '');
}

// Vibration function
function vibrateElement(element, duration = 500) {
    element.style.transition = 'all 0.1s ease';
    element.style.transform = 'translateX(10px)';
    element.style.boxShadow = '0 0 10px rgba(220, 38, 38, 0.5)';
    
    setTimeout(() => {
        element.style.transform = 'translateX(-10px)';
    }, 100);
    
    setTimeout(() => {
        element.style.transform = 'translateX(10px)';
    }, 200);
    
    setTimeout(() => {
        element.style.transform = 'translateX(-10px)';
    }, 300);
    
    setTimeout(() => {
        element.style.transform = 'translateX(0)';
        element.style.boxShadow = '';
    }, 400);
}

// Show error with vibration
function showError(field, message) {
    // Remove existing error
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        color: #dc2626;
        font-size: 12px;
        margin-top: 5px;
        font-weight: 600;
    `;
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    
    // Add error styling to field
    field.style.borderColor = '#dc2626';
    field.style.backgroundColor = '#fef2f2';
    
    // Vibrate the field
    vibrateElement(field);
    
    // Scroll to field
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Focus the field
    field.focus();
}

// Remove error
function removeError(field) {
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    field.style.borderColor = '';
    field.style.backgroundColor = '';
}

// Validate required fields
function validateField(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showError(field, 'Field ini wajib diisi');
        return false;
    }
    
    // Special validation for file input
    if (field.type === 'file' && field.hasAttribute('required') && !field.files[0]) {
        showError(field, 'File poster wajib diupload');
        return false;
    }
    
    // Special validation for date fields
    if (field.type === 'date') {
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
            showError(field, 'Format tanggal tidak valid');
            return false;
        }
    }
    
    // Special validation for time fields
    if (field.type === 'time' && value) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
            showError(field, 'Format waktu tidak valid (HH:MM)');
            return false;
        }
    }
    
    removeError(field);
    return true;
}

// Validate all form fields
function validateForm() {
    const form = document.getElementById('eventForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Additional validation: end date should be after start date
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
    
    if (startDate.value && endDate.value) {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        
        if (end < start) {
            showError(endDate, 'Tanggal selesai harus setelah tanggal mulai');
            isValid = false;
        }
    }
    
    // Additional validation: end time should be after start time for same date
    if (startDate.value === endDate.value && startTime.value && endTime.value) {
        if (endTime.value <= startTime.value) {
            showError(endTime, 'Waktu selesai harus setelah waktu mulai');
            isValid = false;
        }
    }
    
    return isValid;
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("eventForm");
    const posterInput = document.getElementById("poster");
    const posterPreview = document.getElementById("posterPreview");

    // Set default dates to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;

    // Set default time to current time + 1 hour
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    
    const formatTime = (date) => {
        return date.toTimeString().slice(0, 5);
    };
    
    document.getElementById('startTime').value = formatTime(now);
    document.getElementById('endTime').value = formatTime(nextHour);

    // Real-time validation for all fields
    const allFields = form.querySelectorAll('input, textarea, select');
    allFields.forEach(field => {
        field.addEventListener('blur', () => {
            validateField(field);
        });
        
        field.addEventListener('input', () => {
            removeError(field);
            updateSubmitButton();
        });
    });

    // Special validation for file input
    posterInput.addEventListener('change', () => {
        removeError(posterInput);
        updateSubmitButton();
        
        const file = posterInput.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showError(posterInput, 'Hanya file gambar yang diperbolehkan (JPEG, PNG, GIF, WebP)');
                posterInput.value = '';
                return;
            }
            
            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                showError(posterInput, 'Ukuran file terlalu besar. Maksimal 5MB');
                posterInput.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = () => {
                posterPreview.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Preview poster
    posterInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                posterPreview.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Update submit button state
    function updateSubmitButton() {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;
        
        const requiredFields = form.querySelectorAll('[required]');
        let allValid = true;
        
        requiredFields.forEach(field => {
            if (field.type === 'file') {
                if (!field.files || field.files.length === 0) {
                    allValid = false;
                }
            } else if (!field.value.trim()) {
                allValid = false;
            }
        });
        
        submitBtn.disabled = !allValid;
    }

    // Submit form - FIXED VERSION
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            // Vibrate the entire form
            vibrateElement(form);
            alert('Harap perbaiki error di form sebelum melanjutkan!');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        submitBtn.disabled = true;

        try {
            // Convert image to base64 if poster is uploaded
            let posterData = posterPreview.src;
            const posterFile = posterInput.files[0];
            
            if (posterFile && posterFile.size > 0) {
                debugLog("Processing poster upload");
                posterData = await toBase64(posterFile);
            } else {
                // Use default poster if no image uploaded
                posterData = "https://via.placeholder.com/300x200?text=Event+Poster";
                debugLog("Using default poster");
            }

            // CREATE COMPATIBLE EVENT OBJECT FOR BOTH DATABASE AND LOCALSTORAGE
            const eventId = Date.now();
            const eventTitle = document.getElementById("titleEvent").value;
            const eventStartDate = document.getElementById("startDate").value;
            const eventEndDate = document.getElementById("endDate").value;
            const eventStartTime = document.getElementById("startTime").value;
            const eventEndTime = document.getElementById("endTime").value;
            const eventLocation = document.getElementById("location").value;
            const eventDescription = document.getElementById("description").value;
            const eventStatus = document.getElementById("status").value;

            const event = {
                // Database fields
                id: eventId,
                title: eventTitle,
                start_date: eventStartDate,
                end_date: eventEndDate,
                start_time: eventStartTime,
                end_time: eventEndTime,
                location: eventLocation,
                description: eventDescription,
                status: eventStatus,
                poster_url: posterData,
                approval_status: "Disetujui", // Admin langsung menyetujui
                
                // Compatibility fields for localStorage
                titleEvent: eventTitle,
                startDate: eventStartDate,
                endDate: eventEndDate,
                startTime: eventStartTime,
                endTime: eventEndTime,
                poster: posterData,
                approval: "Disetujui"
            };

            debugLog("Event to be saved:", event);

            // Try to save to database via API first
            try {
                debugLog("Saving to database via API");
                const response = await fetch('api_events.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(event)
                });

                const result = await response.json();
                debugLog("API Response:", result);
                
                if (result.success) {
                    // Success vibration
                    submitBtn.style.backgroundColor = '#10b981';
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Berhasil!';
                    
                    setTimeout(() => {
                        alert("Event berhasil ditambahkan ke database!");
                        window.location.href = "dashboard.html";
                    }, 1000);
                    return;
                } else {
                    throw new Error("API returned failure");
                }
            } catch (error) {
                console.error('Error saving to API:', error);
                debugLog("Falling back to localStorage");
                // Continue to localStorage fallback
            }

            // FALLBACK: Save to localStorage dengan struktur yang kompatibel
            const events = JSON.parse(localStorage.getItem("events")) || [];
            
            // Pastikan struktur kompatibel dengan semua halaman
            const compatibleEvent = {
                id: eventId,
                // Untuk dashboard.html (admin)
                title: event.title,
                start_date: event.start_date,
                end_date: event.end_date,
                start_time: event.start_time,
                end_time: event.end_time,
                location: event.location,
                description: event.description,
                status: event.status,
                poster_url: event.poster_url,
                approval_status: event.approval_status,
                
                // Untuk index.html (public) dan detaileventm.html
                titleEvent: event.title,
                startDate: event.start_date,
                endDate: event.end_date,
                startTime: event.start_time,
                endTime: event.end_time,
                poster: event.poster_url,
                approval: event.approval_status
            };
            
            events.push(compatibleEvent);
            localStorage.setItem("events", JSON.stringify(events));

            debugLog("Event saved to localStorage:", compatibleEvent);
            debugLog("Total events in localStorage:", events.length);
            
            // Success vibration
            submitBtn.style.backgroundColor = '#10b981';
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Berhasil!';
            
            setTimeout(() => {
                alert("Event berhasil ditambahkan!");
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {
            console.error('Error adding event:', error);
            
            // Error vibration
            submitBtn.style.backgroundColor = '#dc2626';
            submitBtn.innerHTML = '<i class="fas fa-times"></i> Gagal!';
            vibrateElement(submitBtn);
            
            setTimeout(() => {
                alert("Terjadi kesalahan saat menambahkan event: " + error.message);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = '';
            }, 2000);
        }
    });

    // Initialize submit button state
    updateSubmitButton();
});

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
            hasPoster: !!(event.poster_url || event.poster),
            startDate: event.start_date || event.startDate,
            endDate: event.end_date || event.endDate
        });
    });
    
    return events;
}

// Function to clear all events (for testing)
function clearAllEvents() {
    if (confirm("Yakin ingin menghapus semua events?")) {
        localStorage.removeItem("events");
        console.log("All events cleared from localStorage");
        alert("Semua events telah dihapus!");
    }
}

// Function to add sample event for testing
function addSampleEvent() {
    const sampleEvent = {
        id: Date.now(),
        title: "Sample Event - Seminar Teknologi 2025",
        titleEvent: "Sample Event - Seminar Teknologi 2025",
        start_date: "2025-12-01",
        end_date: "2025-12-01",
        startDate: "2025-12-01",
        endDate: "2025-12-01",
        start_time: "09:00",
        end_time: "17:00",
        startTime: "09:00",
        endTime: "17:00",
        location: "Aula Gedung Utama Kampus",
        description: "Ini adalah event sample untuk testing. Seminar tentang perkembangan teknologi terbaru di tahun 2025.",
        status: "Aktif",
        poster_url: "https://via.placeholder.com/300x200?text=Sample+Event",
        poster: "https://via.placeholder.com/300x200?text=Sample+Event",
        approval_status: "Disetujui",
        approval: "Disetujui"
    };

    const events = JSON.parse(localStorage.getItem("events")) || [];
    events.push(sampleEvent);
    localStorage.setItem("events", JSON.stringify(events));
    
    console.log("Sample event added:", sampleEvent);
    alert("Sample event berhasil ditambahkan!");
    window.location.reload();
}
