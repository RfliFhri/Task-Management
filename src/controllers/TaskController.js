import EnhancedTask from "../models/EnhancedTask";

/**
 * Task Controller - Mengatur alur kerja task management
 * 
 * Controller dalam MVC Pattern:
 * - Menerima input dari user (via View)
 * - Memproses dengan bantuan Model dan Repository
 * - Mengirim response kembali ke View
 * - Tidak mengandung business logic (itu ada di Model/Service)
 */
export default class TaskController {
    constructor(taskRepository, userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.currentUser = null; // User yang sedang login
    }
    
    /**
     * Set current user (simulasi login)
     * @param {string} userId - User ID
     */
    setCurrentUser(userId) {
        this.currentUser = this.userRepository.findById(userId);
        if (!this.currentUser) {
            throw new Error('User tidak ditemukan');
        }
    }
    
    /**
     * Buat task baru
     * @param {Object} taskData - Data task dari form
     * @returns {Object} - Response dengan task yang dibuat atau error
     */
    createTask(taskData) {
        try {
            // Validasi: user harus login
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            // Validasi input
            if (!taskData.title || taskData.title.trim() === '') {
                return {
                    success: false,
                    error: 'Judul task wajib diisi'
                };
            }
            
            // Set owner ke current user
            const taskToCreate = {
                ...taskData,
                ownerId: this.currentUser.id,
                assigneeId: taskData.assigneeId || this.currentUser.id
            };
            
            // Validasi assignee jika ada
            if (taskToCreate.assigneeId !== this.currentUser.id) {
                const assignee = this.userRepository.findById(taskToCreate.assigneeId);
                if (!assignee) {
                    return {
                        success: false,
                        error: 'User yang di-assign tidak ditemukan'
                    };
                }
            }
            
            // Buat task melalui repository
            const task = this.taskRepository.create(taskToCreate);
            
            return {
                success: true,
                data: task,
                message: `Task "${task.title}" berhasil dibuat`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Ambil semua task user
     * @param {Object} filters - Filter options
     * @returns {Object} - Response dengan array task
     */
    getTasks(filters = {}) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            // Set filter untuk current user
            const userFilters = {
                ...filters,
                ownerId: this.currentUser.id
            };
            
            // Ambil task dengan filter
            let tasks = this.taskRepository.filter(userFilters);
            
            // Sort berdasarkan parameter
            const sortBy = filters.sortBy || 'createdAt';
            const sortOrder = filters.sortOrder || 'desc';
            tasks = this.taskRepository.sort(tasks, sortBy, sortOrder);
            
            return {
                success: true,
                data: tasks,
                count: tasks.length
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Ambil task berdasarkan ID
     * @param {string} taskId - Task ID
     * @returns {Object} - Response dengan task atau error
     */
    getTask(taskId) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const task = this.taskRepository.findById(taskId);
            
            if (!task) {
                return {
                    success: false,
                    error: 'Task tidak ditemukan'
                };
            }
            
            // Cek permission: hanya owner atau assignee yang bisa lihat
            if (task.ownerId !== this.currentUser.id && task.assigneeId !== this.currentUser.id) {
                return {
                    success: false,
                    error: 'Anda tidak memiliki akses ke task ini'
                };
            }
            
            return {
                success: true,
                data: task
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Update task
     * @param {string} taskId - Task ID
     * @param {Object} updates - Data yang akan diupdate
     * @returns {Object} - Response dengan task yang diupdate atau error
     */
    updateTask(taskId, updates) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const task = this.taskRepository.findById(taskId);
            
            if (!task) {
                return {
                    success: false,
                    error: 'Task tidak ditemukan'
                };
            }
            
            // Cek permission: hanya owner yang bisa update
            if (task.ownerId !== this.currentUser.id) {
                return {
                    success: false,
                    error: 'Hanya owner yang bisa mengubah task'
                };
            }
            
            // Validasi assignee jika ada update
            if (updates.assigneeId) {
                const assignee = this.userRepository.findById(updates.assigneeId);
                if (!assignee) {
                    return {
                        success: false,
                        error: 'User yang di-assign tidak ditemukan'
                    };
                }
            }
            
            // Update task melalui repository
            const updatedTask = this.taskRepository.update(taskId, updates);
            
            return {
                success: true,
                data: updatedTask,
                message: 'Task berhasil diupdate'
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Hapus task
     * @param {string} taskId - Task ID
     * @returns {Object} - Response success atau error
     */
    deleteTask(taskId) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const task = this.taskRepository.findById(taskId);
            
            if (!task) {
                return {
                    success: false,
                    error: 'Task tidak ditemukan'
                };
            }
            
            // Cek permission: hanya owner yang bisa hapus
            if (task.ownerId !== this.currentUser.id) {
                return {
                    success: false,
                    error: 'Hanya owner yang bisa menghapus task'
                };
            }
            
            // Hapus task melalui repository
            const deleted = this.taskRepository.delete(taskId);
            
            if (deleted) {
                return {
                    success: true,
                    message: `Task "${task.title}" berhasil dihapus`
                };
            } else {
                return {
                    success: false,
                    error: 'Gagal menghapus task'
                };
            }
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Toggle status task (complete/incomplete)
     * @param {string} taskId - Task ID
     * @returns {Object} - Response dengan task yang diupdate
     */
    toggleTaskStatus(taskId) {
        try {
            const task = this.taskRepository.findById(taskId);
            
            if (!task) {
                return {
                    success: false,
                    error: 'Task tidak ditemukan'
                };
            }
            
            // Assignee juga bisa toggle status
            if (task.ownerId !== this.currentUser.id && task.assigneeId !== this.currentUser.id) {
                return {
                    success: false,
                    error: 'Anda tidak memiliki akses ke task ini'
                };
            }
            
            const newStatus = task.isCompleted ? 'pending' : 'completed';
            const updatedTask = this.taskRepository.update(taskId, { status: newStatus });
            
            return {
                success: true,
                data: updatedTask,
                message: `Task ${newStatus === 'completed' ? 'selesai' : 'belum selesai'}`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Search task
     * @param {string} query - Search query
     * @returns {Object} - Response dengan hasil search
     */
    searchTasks(query) {
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
            
            // Search semua task, lalu filter untuk current user
            const allResults = this.taskRepository.search(query);
            const userResults = allResults.filter(task => 
                task.ownerId === this.currentUser.id || task.assigneeId === this.currentUser.id
            );
            
            return {
                success: true,
                data: userResults,
                count: userResults.length,
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
     * Get task statistics
     * @returns {Object} - Response dengan statistik task
     */
    getTaskStats() {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const stats = this.taskRepository.getStats(this.currentUser.id);
            
            return {
                success: true,
                data: stats
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get overdue tasks
     * @returns {Object} - Response dengan task yang overdue
     */
    getOverdueTasks() {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const overdueTasks = this.taskRepository.findOverdue()
                .filter(task => task.ownerId === this.currentUser.id || task.assigneeId === this.currentUser.id);
            
            return {
                success: true,
                data: overdueTasks,
                count: overdueTasks.length
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get tasks due soon
     * @param {number} days - Jumlah hari ke depan
     * @returns {Object} - Response dengan task yang akan due
     */
    getTasksDueSoon(days = 3) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const dueSoonTasks = this.taskRepository.findDueSoon(days)
                .filter(task => task.ownerId === this.currentUser.id || task.assigneeId === this.currentUser.id);
            
            return {
                success: true,
                data: dueSoonTasks,
                count: dueSoonTasks.length
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get tasks by category
     * @param {string} category - Category to filter by
     * @returns {Object} - Response dengan filtered tasks
     */
    getTasksByCategory(category) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            // Validate category
            const validCategories = EnhancedTask.getAvailableCategories();
            if (!validCategories.includes(category)) {
                return {
                    success: false,
                    error: 'Kategori tidak valid'
                };
            }
            
            // Get user's tasks in specific category
            const userTasks = this.taskRepository.findByOwner(this.currentUser.id);
            const categoryTasks = userTasks.filter(task => task.isInCategory(category));
            
            // Sort by priority and due date
            const sortedTasks = this.taskRepository.sort(categoryTasks, 'priority', 'desc');
            
            return {
                success: true,
                data: sortedTasks,
                count: sortedTasks.length,
                category: category,
                categoryDisplayName: EnhancedTask.prototype.getCategoryDisplayName.call({ _category: category })
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get category statistics for current user
     * @returns {Object} - Response dengan category statistics
     */
    getCategoryStats() {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const stats = this.taskRepository.getCategoryStats(this.currentUser.id);
            const mostUsed = this.taskRepository.getMostUsedCategories(this.currentUser.id);
            
            return {
                success: true,
                data: {
                    byCategory: stats,
                    mostUsed: mostUsed,
                    totalCategories: Object.keys(stats).filter(cat => stats[cat].total > 0).length
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update task category
     * @param {string} taskId - Task ID
     * @param {string} newCategory - New category
     * @returns {Object} - Response dengan updated task
     */
    updateTaskCategory(taskId, newCategory) {
        try {
            if (!this.currentUser) {
                return {
                    success: false,
                    error: 'User harus login terlebih dahulu'
                };
            }
            
            const task = this.taskRepository.findById(taskId);
            
            if (!task) {
                return {
                    success: false,
                    error: 'Task tidak ditemukan'
                };
            }
            
            // Check permission
            if (task.ownerId !== this.currentUser.id) {
                return {
                    success: false,
                    error: 'Hanya owner yang bisa mengubah kategori task'
                };
            }
            
            // Validate category
            const validCategories = EnhancedTask.getAvailableCategories();
            if (!validCategories.includes(newCategory)) {
                return {
                    success: false,
                    error: 'Kategori tidak valid'
                };
            }
            
            // Update category
            const updatedTask = this.taskRepository.update(taskId, { category: newCategory });
            
            return {
                success: true,
                data: updatedTask,
                message: `Kategori task berhasil diubah ke ${EnhancedTask.prototype.getCategoryDisplayName.call({ _category: newCategory })}`
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get available categories
     * @returns {Object} - Response dengan available categories
     */
    getAvailableCategories() {
        try {
            const categories = EnhancedTask.getAvailableCategories();
            const categoriesWithDisplay = categories.map(category => ({
                value: category,
                label: EnhancedTask.prototype.getCategoryDisplayName.call({ _category: category })
            }));
            
            return {
                success: true,
                data: categoriesWithDisplay
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Handle events from task service
     * @param {string} eventType - Event type
     * @param {any} data - Event data
     */
    handleTaskServiceEvent(eventType, data) {
        switch (eventType) {
            case 'taskCreated':
            case 'taskUpdated':
            case 'taskDeleted':
                // Refresh view when tasks change
                this.refreshTasks();
                break;
            case 'error':
                if (this.taskView && typeof this.taskView.showError === 'function') {
                    this.taskView.showError(data.error);
                }
                break;
        }
    }
}
