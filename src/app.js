import UserRepository from './repositories/UserRepository.js';
import TaskRepository from './repositories/TaskRepository.js';
import UserController from './controllers/UserController.js';
import TaskController from './controllers/TaskController.js';
import TaskView from './views/TaskView.js';
import EnhancedStorageManager from './utils/EnhancedStorageManager.js';


/**
 * Day 2 Main Application - MVC Implementation
 * 
 * Orchestrates semua komponen:
 * - Storage Manager
 * - Repositories
 * - Controllers
 * - Views
 * - User Authentication
 */

// Global application state
let app = {
    storage: null,
    userRepository: null,
    taskRepository: null,
    userController: null,
    taskController: null,
    taskView: null,
    currentUser: null
};

/**
 * Initialize aplikasi
 */
function initializeApp() {
    console.log('🚀 Initializing Day 2 Task Management System...');
    
    try {
        // Initialize storage manager
        app.storage = new EnhancedStorageManager('taskAppDay2', '2.0');
        console.log('✅ Storage manager initialized');
        
        // Initialize repositories
        app.userRepository = new UserRepository(app.storage);
        app.taskRepository = new TaskRepository(app.storage);
        console.log('✅ Repositories initialized');
        
        // Initialize controllers
        app.userController = new UserController(app.userRepository);
        app.taskController = new TaskController(app.taskRepository, app.userRepository);
        console.log('✅ Controllers initialized');
        
        // Initialize view
        app.taskView = new TaskView(app.taskController, app.userController);
        console.log('✅ Views initialized');
        
        // Setup authentication event listeners
        setupAuthEventListeners();
        
        // Create demo user jika belum ada
        createDemoUserIfNeeded();
        
        // Show login section
        showLoginSection();
        
        console.log('✅ Day 2 Application initialized successfully!');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        showMessage('Gagal menginisialisasi aplikasi: ' + error.message, 'error');
    }
}

/**
 * Setup authentication event listeners
 */
function setupAuthEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Register button
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', showRegisterModal);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Username input (Enter key)
    const usernameInput = document.getElementById('usernameInput');
    if (usernameInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Register modal close
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const cancelRegister = document.getElementById('cancelRegister');
    if (closeRegisterModal) {
        closeRegisterModal.addEventListener('click', hideRegisterModal);
    }
    if (cancelRegister) {
        cancelRegister.addEventListener('click', hideRegisterModal);
    }
    
    // Quick action buttons
    const showOverdueBtn = document.getElementById('showOverdueBtn');
    const showDueSoonBtn = document.getElementById('showDueSoonBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const refreshTasks = document.getElementById('refreshTasks');
    
    if (showOverdueBtn) {
        showOverdueBtn.addEventListener('click', showOverdueTasks);
    }
    if (showDueSoonBtn) {
        showDueSoonBtn.addEventListener('click', showDueSoonTasks);
    }
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAppData);
    }
    if (refreshTasks) {
        refreshTasks.addEventListener('click', () => app.taskView.refresh());
    }
}

/**
 * Handle user login
 */
function handleLogin() {
    const usernameInput = document.getElementById('usernameInput');
    const username = usernameInput.value.trim();
    
    if (!username) {
        showMessage('Username wajib diisi', 'error');
        return;
    }
    
    const response = app.userController.login(username);
    
    if (response.success) {
        app.currentUser = response.data;
        
        // Set current user di task controller
        app.taskController.setCurrentUser(app.currentUser.id);
        
        // Show main content
        showMainContent();
        
        // Load user list untuk assign dropdown
        loadUserListForAssign();
        
        // Refresh views
        app.taskView.refresh();
        
        showMessage(response.message, 'success');
    } else {
        showMessage(response.error, 'error');
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    const response = app.userController.logout();
    
    app.currentUser = null;
    
    // Hide main content
    hideMainContent();
    
    // Show login section
    showLoginSection();
    
    showMessage(response.message, 'info');
}

/**
 * Show register modal
 */
function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * Hide register modal
 */
function hideRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Reset form
    const form = document.getElementById('registerForm');
    if (form) {
        form.reset();
    }
}

/**
 * Handle user registration
 */
function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        username: formData.get('username')?.trim(),
        email: formData.get('email')?.trim(),
        fullName: formData.get('fullName')?.trim()
    };
    
    const response = app.userController.register(userData);
    
    if (response.success) {
        hideRegisterModal();
        showMessage(response.message, 'success');
        
        // Auto-fill username untuk login
        const usernameInput = document.getElementById('usernameInput');
        if (usernameInput) {
            usernameInput.value = userData.username;
        }
    } else {
        showMessage(response.error, 'error');
    }
}

/**
 * Show login section
 */
function showLoginSection() {
    const loginSection = document.getElementById('loginSection');
    const userInfo = document.getElementById('userInfo');
    const mainContent = document.getElementById('mainContent');
    
    if (loginSection) loginSection.style.display = 'flex';
    if (userInfo) userInfo.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    
    // Clear username input
    const usernameInput = document.getElementById('usernameInput');
    if (usernameInput) {
        usernameInput.value = '';
        usernameInput.focus();
    }
}

/**
 * Show main content
 */
function showMainContent() {
    const loginSection = document.getElementById('loginSection');
    const userInfo = document.getElementById('userInfo');
    const mainContent = document.getElementById('mainContent');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (loginSection) loginSection.style.display = 'none';
    if (userInfo) userInfo.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'block';
    
    if (welcomeMessage && app.currentUser) {
        welcomeMessage.textContent = `Selamat datang, ${app.currentUser.fullName || app.currentUser.username}!`;
    }
}

/**
 * Hide main content
 */
function hideMainContent() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.style.display = 'none';
    }
}

/**
 * Load user list untuk assign dropdown
 */
function loadUserListForAssign() {
    const response = app.userController.getAllUsers();
    
    if (response.success) {
        const assigneeSelect = document.getElementById('taskAssignee');
        if (assigneeSelect) {
            // Clear existing options except "self"
            assigneeSelect.innerHTML = '<option value="self">Diri Sendiri</option>';
            
            // Add other users
            response.data.forEach(user => {
                if (user.id !== app.currentUser.id) {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = user.fullName || user.username;
                    assigneeSelect.appendChild(option);
                }
            });
        }
    }
}

/**
 * Show overdue tasks
 */
function showOverdueTasks() {
    const response = app.taskController.getOverdueTasks();
    
    if (response.success) {
        if (response.count === 0) {
            showMessage('Tidak ada task yang overdue', 'info');
        } else {
            showMessage(`Ditemukan ${response.count} task yang overdue`, 'warning');
            // Filter view untuk menampilkan overdue tasks
            // Implementasi ini bisa diperbaiki dengan menambah filter khusus
        }
    } else {
        showMessage(response.error, 'error');
    }
}

/**
 * Show tasks due soon
 */
function showDueSoonTasks() {
    const response = app.taskController.getTasksDueSoon(3);
    
    if (response.success) {
        if (response.count === 0) {
            showMessage('Tidak ada task yang akan due dalam 3 hari', 'info');
        } else {
            showMessage(`Ditemukan ${response.count} task yang akan due dalam 3 hari`, 'warning');
        }
    } else {
        showMessage(response.error, 'error');
    }
}

/**
 * Export app data
 */
function exportAppData() {
    const exportData = app.storage.exportData();
    
    if (exportData) {
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `task-app-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showMessage('Data berhasil diekspor', 'success');
    } else {
        showMessage('Gagal mengekspor data', 'error');
    }
}

/**
 * Create demo user jika belum ada
 */
function createDemoUserIfNeeded() {
    const users = app.userRepository.findAll();
    
    if (users.length === 0) {
        try {
            // Buat demo user
            app.userRepository.create({
                username: 'demo',
                email: 'demo@example.com',
                fullName: 'Demo User'
            });
            
            app.userRepository.create({
                username: 'john',
                email: 'john@example.com',
                fullName: 'John Doe'
            });
            
            console.log('✅ Demo users created');
        } catch (error) {
            console.error('Failed to create demo users:', error);
        }
    }
}

/**
 * Show message to user
 */
function showMessage(message, type = 'info') {
    if (app.taskView) {
        app.taskView.showMessage(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

/**
 * Handle errors globally
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showMessage('Terjadi kesalahan pada aplikasi', 'error');
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showMessage('Terjadi kesalahan pada aplikasi', 'error');
});

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Export untuk testing (jika diperlukan)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        handleLogin,
        handleLogout,
        handleRegister,
        app
    };
}