import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://YOUR_PROJECT.supabase.co'
const supabaseKey = 'YOUR_PUBLIC_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

// Ambil event untuk tampilan publik (hanya Disetujui + Aktif)
async function loadEvents() {
  const container = document.getElementById('eventContainer')
  if (!container) return

  container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #777;">
    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 10px;"></i>
    <div>Memuat event...</div>
  </div>`

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('approval_status', 'Disetujui')
    .eq('status', 'Aktif')
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Gagal ambil data:', error)
    container.innerHTML = `<p style="text-align:center;color:red">Gagal memuat event</p>`
    return
  }

  if (!data || data.length === 0) {
    container.innerHTML = `<p style="text-align:center">Belum ada event tersedia</p>`
    return
  }

  container.innerHTML = ''
  data.forEach((ev) => {
    const box = document.createElement('div')
    box.className = 'box'
    box.innerHTML = `
      <img src="${ev.poster_url || 'picture/default.jpg'}"
           alt="Poster ${ev.title}"
           onerror="this.src='picture/default.jpg'"
           style="width:100%; height:200px; object-fit:cover; border-radius:10px;">
      <h3>${ev.title}</h3>
      <p>${(ev.description || '').slice(0, 120)}${(ev.description || '').length > 120 ? '...' : ''}</p>
      <div class="button-group">
        <button class="btn-detail" onclick="viewEvent(${ev.id})">Lihat Detail</button>
      </div>
    `
    container.appendChild(box)
  })
}

function viewEvent(id) {
  localStorage.setItem('selectedEventId', id)
  window.location.href = 'detaileventm.html'
}

document.addEventListener('DOMContentLoaded', () => {
  loadEvents()

  // Optional: search live
  const searchInput = document.getElementById('searchInput')
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase()
      const boxes = document.querySelectorAll('.box-event .box')
      let visible = 0
      boxes.forEach((box) => {
        const text = box.innerText.toLowerCase()
        const match = text.includes(q)
        box.style.display = match ? 'block' : 'none'
        if (match) visible++
      })
      const container = document.getElementById('eventContainer')
      if (container) {
        let noResults = container.querySelector('.no-results')
        if (visible === 0 && q.length > 0) {
          if (!noResults) {
            noResults = document.createElement('div')
            noResults.className = 'no-results'
            noResults.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 40px; color: #777;'
            noResults.innerHTML = `
              <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px;"></i>
              <div>Tidak ada event yang ditemukan</div>
            `
            container.appendChild(noResults)
          }
        } else if (noResults) {
          noResults.remove()
        }
      }
    })
  }
})
