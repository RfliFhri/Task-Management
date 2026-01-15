# User Stories - Task Management System Day 2

## User Management
- **US-001**: Sebagai user baru, saya ingin bisa membuat akun dengan username, agar saya bisa menggunakan aplikasi
- **US-002**: Sebagai user, saya ingin bisa login dengan username, agar saya bisa mengakses task saya
- **US-003**: Sebagai user, saya ingin melihat profil saya, agar saya tahu informasi akun saya

## Enhanced Task Management  
- **US-004**: Sebagai user, saya ingin mengkategorikan task (Work/Personal/Study), agar saya bisa mengorganisir task dengan lebih baik
- **US-005**: Sebagai user, saya ingin menambahkan due date pada task, agar saya tahu kapan deadline-nya
- **US-006**: Sebagai user, saya ingin melihat task yang overdue, agar saya bisa prioritaskan yang urgent
- **US-007**: Sebagai user, saya ingin assign task ke user lain, agar bisa berkolaborasi

## Filtering & Organization
- **US-008**: Sebagai user, saya ingin filter task berdasarkan kategori, agar fokus pada jenis task tertentu
- **US-009**: Sebagai user, saya ingin melihat task yang akan due dalam 3 hari, agar bisa prepare
- **US-010**: Sebagai user, saya ingin melihat statistik task saya, agar tahu produktivitas saya

## Acceptance Criteria

### US-001: User Registration
**Given** saya adalah user baru  
**When** saya mengisi form registrasi dengan username, email, dan nama lengkap  
**Then** sistem membuat akun baru dan saya bisa login  

**Validation Rules:**
- Username wajib diisi dan unik
- Email wajib diisi dan format valid
- Nama lengkap opsional

### US-002: User Login
**Given** saya sudah punya akun  
**When** saya memasukkan username yang benar  
**Then** sistem menampilkan dashboard task saya  

### US-004: Task Categories
**Given** saya sedang membuat task baru  
**When** saya memilih kategori dari dropdown  
**Then** task tersimpan dengan kategori yang dipilih  

**Available Categories:**
- Work
- Personal  
- Study
- Health
- Finance
- Other

### US-005: Due Dates
**Given** saya sedang membuat/edit task  
**When** saya set due date  
**Then** sistem menampilkan warning jika task overdue  

### US-007: Task Assignment
**Given** saya adalah owner task  
**When** saya assign task ke user lain  
**Then** task muncul di dashboard assignee  

## Technical Requirements

### Data Models
- **User**: id, username, email, fullName, createdAt, preferences
- **Task**: id, title, description, category, priority, dueDate, ownerId, assigneeId, status, tags, estimatedHours

### Storage
- LocalStorage untuk persistence
- JSON format untuk data serialization
- Automatic save setelah setiap perubahan

### UI Requirements
- Responsive design (mobile & desktop)
- Real-time search dan filtering
- Visual indicators untuk overdue tasks
- Statistics dashboard

### Performance
- Load time < 2 detik
- Smooth interactions
- Handle 100+ tasks tanpa lag

## Out of Scope (Future Enhancements)
- Real-time collaboration
- File attachments
- Task dependencies
- Advanced reporting
- Mobile app
- Email notifications