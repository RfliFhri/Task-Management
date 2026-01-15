import User from '../models/User.js';
/**
 * User Repository - Mengelola penyimpanan dan pengambilan data User
 * 
 * Repository Pattern:
 * - Abstraksi untuk akses data
 * - Memisahkan business logic dari storage logic
 * - Mudah untuk testing dan switching storage
 */
export default class UserRepository {
    constructor(storageManager) {
        this.storage = storageManager;
        this.users = new Map(); // Cache in-memory untuk performa
        this.storageKey = 'users';
        
        // Load existing users dari storage
        this._loadUsersFromStorage();
    }
    
    /**
     * Buat user baru
     * @param {Object} userData - Data user (username, email, fullName)
     * @returns {User} - User yang baru dibuat
     */
    create(userData) {
        try {
            // Cek apakah username sudah ada
            if (this.findByUsername(userData.username)) {
                throw new Error(`Username '${userData.username}' sudah digunakan`);
            }
            
            // Cek apakah email sudah ada
            if (this.findByEmail(userData.email)) {
                throw new Error(`Email '${userData.email}' sudah digunakan`);
            }
            
            // Buat user baru
            const user = new User(userData.username, userData.email, userData.fullName);
            
            // Simpan ke cache
            this.users.set(user.id, user);
            
            // Persist ke storage
            this._saveUsersToStorage();
            
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    
    /**
     * Cari user berdasarkan ID
     * @param {string} id - User ID
     * @returns {User|null} - User atau null jika tidak ditemukan
     */
    findById(id) {
        return this.users.get(id) || null;
    }
    
    /**
     * Cari user berdasarkan username
     * @param {string} username - Username
     * @returns {User|null} - User atau null jika tidak ditemukan
     */
    findByUsername(username) {
        const normalizedUsername = username.toLowerCase();
        for (const user of this.users.values()) {
            if (user.username === normalizedUsername) {
                return user;
            }
        }
        return null;
    }
    
    /**
     * Cari user berdasarkan email
     * @param {string} email - Email
     * @returns {User|null} - User atau null jika tidak ditemukan
     */
    findByEmail(email) {
        const normalizedEmail = email.toLowerCase();
        for (const user of this.users.values()) {
            if (user.email === normalizedEmail) {
                return user;
            }
        }
        return null;
    }
    
    /**
     * Ambil semua user
     * @returns {User[]} - Array semua user
     */
    findAll() {
        return Array.from(this.users.values());
    }
    
    /**
     * Ambil user aktif saja
     * @returns {User[]} - Array user yang aktif
     */
    findActive() {
        return this.findAll().filter(user => user.isActive);
    }
    
    /**
     * Update user
     * @param {string} id - User ID
     * @param {Object} updates - Data yang akan diupdate
     * @returns {User|null} - User yang sudah diupdate atau null
     */
    update(id, updates) {
        const user = this.findById(id);
        if (!user) {
            return null;
        }
        
        try {
            // Update profile jika ada
            if (updates.fullName !== undefined || updates.email !== undefined) {
                user.updateProfile(updates.fullName, updates.email);
            }
            
            // Update preferences jika ada
            if (updates.preferences) {
                user.updatePreferences(updates.preferences);
            }
            
            // Update status jika ada
            if (updates.isActive !== undefined) {
                if (updates.isActive) {
                    user.activate();
                } else {
                    user.deactivate();
                }
            }
            
            // Persist changes
            this._saveUsersToStorage();
            
            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
    
    /**
     * Hapus user (soft delete - set inactive)
     * @param {string} id - User ID
     * @returns {boolean} - Success status
     */
    delete(id) {
        const user = this.findById(id);
        if (!user) {
            return false;
        }
        
        user.deactivate();
        this._saveUsersToStorage();
        return true;
    }
    
    /**
     * Hapus user permanen
     * @param {string} id - User ID
     * @returns {boolean} - Success status
     */
    hardDelete(id) {
        if (this.users.has(id)) {
            this.users.delete(id);
            this._saveUsersToStorage();
            return true;
        }
        return false;
    }
    
    /**
     * Record login user
     * @param {string} id - User ID
     * @returns {User|null} - User yang login
     */
    recordLogin(id) {
        const user = this.findById(id);
        if (user) {
            user.recordLogin();
            this._saveUsersToStorage();
        }
        return user;
    }
    
    /**
     * Cari user dengan query
     * @param {string} query - Search query
     * @returns {User[]} - Array user yang match
     */
    search(query) {
        const searchTerm = query.toLowerCase();
        return this.findAll().filter(user => 
            user.username.includes(searchTerm) ||
            user.email.includes(searchTerm) ||
            user.fullName.toLowerCase().includes(searchTerm)
        );
    }
    
    /**
     * Get user statistics
     * @returns {Object} - User statistics
     */
    getStats() {
        const allUsers = this.findAll();
        const activeUsers = this.findActive();
        
        return {
            total: allUsers.length,
            active: activeUsers.length,
            inactive: allUsers.length - activeUsers.length,
            recentLogins: allUsers.filter(user => {
                if (!user.lastLoginAt) return false;
                const dayAgo = new Date();
                dayAgo.setDate(dayAgo.getDate() - 1);
                return user.lastLoginAt > dayAgo;
            }).length
        };
    }
    
    // Private methods
    _loadUsersFromStorage() {
        try {
            const usersData = this.storage.load(this.storageKey, []);
            
            usersData.forEach(userData => {
                try {
                    const user = User.fromJSON(userData);
                    this.users.set(user.id, user);
                } catch (error) {
                    console.error('Error loading user:', userData, error);
                }
            });
            
            console.log(`Loaded ${this.users.size} users from storage`);
        } catch (error) {
            console.error('Error loading users from storage:', error);
        }
    }
    
    _saveUsersToStorage() {
        try {
            const usersData = Array.from(this.users.values()).map(user => user.toJSON());
            this.storage.save(this.storageKey, usersData);
        } catch (error) {
            console.error('Error saving users to storage:', error);
        }
    }
}
