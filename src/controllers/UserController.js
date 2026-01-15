/**
 * User Controller - Mengatur alur kerja user management
 * 
 * Handles:
 * - User registration dan login
 * - Profile management
 * - User preferences
 * - Authentication simulation
 */
export default class UserController {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.currentUser = null;
    }
    
    /**
     * Register user baru
     * @param {Object} userData - Data user (username, email, fullName)
     * @returns {Object} - Response dengan user yang dibuat atau error
     */
    register(userData) {
        try {
            // Validasi input
            if (!userData.username || userData.username.trim() === '') {
                return {
                    success: false,
                    error: 'Username wajib diisi'
                };
            }
            
            if (!userData.email || userData.email.trim() === '') {
                return {
                    success: false,
                    error: 'Email wajib diisi'
                };
            }
            
            // Buat user baru
            const user = this.userRepository.create(userData);
            
            return {
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName
                },
                message: `User ${user.username} berhasil didaftarkan`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Login user (simulasi)
     * @param {string} username - Username
     * @returns {Object} - Response dengan user data atau error
     */
    login(username) {
        try {
            if (!username || username.trim() === '') {
                return {
                    success: false,
                    error: 'Username wajib diisi'
                };
            }
            
            const user = this.userRepository.findByUsername(username);
            
            if (!user) {
                return {
                    success: false,
                    error: 'User tidak ditemukan'
                };
            }
            
            if (!user.isActive) {
                return {
                    success: false,
                    error: 'Akun tidak aktif'
                };
            }
            
            // Record login
            this.userRepository.recordLogin(user.id);
            this.currentUser = user;
            
            return {
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    preferences: user.preferences
                },
                message: `Selamat datang, ${user.fullName || user.username}!`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Logout user
     * @returns {Object} - Response success
     */
    logout() {
        const username = this.currentUser ? this.currentUser.username : 'User';
        this.currentUser = null;
        
        return {
            success: true,
            message: `${username} berhasil logout`
        };
    }
    
    /**
     * Get current user
     * @returns {Object} - Response dengan current user atau error
     */
    getCurrentUser() {
        if (!this.currentUser) {
            return {
                success: false,
                error: 'Tidak ada user yang login'
            };
        }
        
        return {
            success: true,
            data: {
                id: this.currentUser.id,
                username: this.currentUser.username,
                email: this.currentUser.email,
                fullName: this.currentUser.fullName,
                role: this.currentUser.role,
                preferences: this.currentUser.preferences,
                lastLoginAt: this.currentUser.lastLoginAt
            }
        };
    }
    
    /**
     * Update user profile
     * @param {Object} updates - Data yang akan diupdate
     * @returns {Object} - Response dengan user yang diupdate atau error
     */
    updateProfile(updates) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const updatedUser = this.userRepository.update(this.currentUser.id, updates);
            
            if (!updatedUser) {
                return {
                    success: false,
                    error: 'Gagal mengupdate profile'
                };
            }
            
            // Update current user reference
            this.currentUser = updatedUser;
            
            return {
                success: true,
                data: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    fullName: updatedUser.fullName,
                    preferences: updatedUser.preferences
                },
                message: 'Profile berhasil diupdate'
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Update user preferences
     * @param {Object} preferences - Preferences baru
     * @returns {Object} - Response success atau error
     */
    updatePreferences(preferences) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const updatedUser = this.userRepository.update(this.currentUser.id, {
                preferences: preferences
            });
            
            if (!updatedUser) {
                return {
                    success: false,
                    error: 'Gagal mengupdate preferences'
                };
            }
            
            this.currentUser = updatedUser;
            
            return {
                success: true,
                data: updatedUser.preferences,
                message: 'Preferences berhasil diupdate'
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get all users (untuk assign task)
     * @returns {Object} - Response dengan list user
     */
    getAllUsers() {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const users = this.userRepository.findActive();
            
            // Return data minimal untuk privacy
            const userData = users.map(user => ({
                id: user.id,
                username: user.username,
                fullName: user.fullName
            }));
            
            return {
                success: true,
                data: userData,
                count: userData.length
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Search users
     * @param {string} query - Search query
     * @returns {Object} - Response dengan hasil search
     */
    searchUsers(query) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            if (!query || query.trim() === '') {
                return {
                    success: false,
                    error: 'Query pencarian tidak boleh kosong'
                };
            }
            
            const users = this.userRepository.search(query);
            
            // Return data minimal untuk privacy
            const userData = users
                .filter(user => user.isActive)
                .map(user => ({
                    id: user.id,
                    username: user.username,
                    fullName: user.fullName
                }));
            
            return {
                success: true,
                data: userData,
                count: userData.length,
                query: query
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Check if user is logged in
     * @returns {boolean} - Login status
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    /**
     * Get user by ID (untuk display assignee name)
     * @param {string} userId - User ID
     * @returns {Object} - Response dengan user data atau error
     */
    getUserById(userId) {
        try {
            const user = this.userRepository.findById(userId);
            
            if (!user) {
                return {
                    success: false,
                    error: 'User tidak ditemukan'
                };
            }
            
            return {
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    fullName: user.fullName
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

