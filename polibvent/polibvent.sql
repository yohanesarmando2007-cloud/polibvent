-- Buat database
CREATE DATABASE IF NOT EXISTS polibvent;
USE polibvent;

-- Tabel untuk admin/users
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role ENUM('super_admin', 'admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel untuk events
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    poster_url VARCHAR(500),
    status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
    approval_status ENUM('Menunggu', 'Disetujui', 'Ditolak') DEFAULT 'Menunggu',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert data admin default (password: 12345)
INSERT INTO admin_users (username, password, email, full_name, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@polibvent.com', 'Administrator Utama', 'super_admin');

-- Insert sample events
INSERT INTO events (title, description, start_date, end_date, start_time, end_time, location, poster_url, status, approval_status, created_by) VALUES
('Seminar Teknologi 2025', 'Seminar tentang perkembangan teknologi terkini dengan pembicara ahli dari industri.', '2025-03-15', '2025-03-15', '09:00:00', '16:00:00', 'Aula Gedung A, Politeknik Negeri Batam', 'uploads/posters/seminar_tech_2025.jpg', 'Aktif', 'Disetujui', 1),
('Festival Musik Kampus', 'Festival musik tahunan menampilkan bakat-bakat musik dari mahasiswa Polibatam.', '2025-04-20', '2025-04-21', '18:00:00', '22:00:00', 'Lapangan Parkir Kampus', 'uploads/posters/festival_music_2025.jpg', 'Aktif', 'Disetujui', 1),
('Kompetisi Programming', 'Lomba programming untuk mengasah kemampuan coding mahasiswa.', '2025-05-10', '2025-05-10', '08:00:00', '17:00:00', 'Lab Komputer Gedung B', 'uploads/posters/comp_programming_2025.jpg', 'Aktif', 'Disetujui', 1);