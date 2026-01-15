import EnhancedTask from '../models/EnhancedTask.js';
/**
 * Task Repository - Mengelola penyimpanan dan pengambilan data Task
 * 
 * Repository Pattern untuk Task dengan fitur:
 * - CRUD operations
 * - Query methods (filter, search, sort)
 * - User-specific operations
 * - Statistics dan reporting
 */
export default class TaskRepository {
    constructor(storageManager) {
        this.storage = storageManager;
        this.tasks = new Map(); // Cache in-memory
        this.storageKey = 'tasks';
        
        // Load existing tasks dari storage
        this._loadTasksFromStorage();
    }
    
    /**
     * Buat task baru
     * @param {Object} taskData - Data task
     * @returns {EnhancedTask} - Task yang baru dibuat
     */
    create(taskData) {
        try {
            const task = new EnhancedTask(
                taskData.title,
                taskData.description,
                taskData.ownerId,
                taskData
            );
            
            // Simpan ke cache
            this.tasks.set(task.id, task);
            
            // Persist ke storage
            this._saveTasksToStorage();
            
            return task;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }
    
    /**
     * Cari task berdasarkan ID
     * @param {string} id - Task ID
     * @returns {EnhancedTask|null} - Task atau null
     */
    findById(id) {
        return this.tasks.get(id) || null;
    }
    
    /**
     * Ambil semua task
     * @returns {EnhancedTask[]} - Array semua task
     */
    findAll() {
        return Array.from(this.tasks.values());
    }
    
    /**
     * Cari task berdasarkan owner
     * @param {string} ownerId - Owner ID
     * @returns {EnhancedTask[]} - Array task milik owner
     */
    findByOwner(ownerId) {
        return this.findAll().filter(task => task.ownerId === ownerId);
    }
    
    /**
     * Cari task berdasarkan assignee
     * @param {string} assigneeId - Assignee ID
     * @returns {EnhancedTask[]} - Array task yang di-assign ke user
     */
    findByAssignee(assigneeId) {
        return this.findAll().filter(task => task.assigneeId === assigneeId);
    }
    
    /**
     * Cari task berdasarkan kategori
     * @param {string} category - Kategori
     * @returns {EnhancedTask[]} - Array task dengan kategori tertentu
     */
    findByCategory(category) {
        return this.findAll().filter(task => task.category === category);
    }
    
    /**
     * Cari task berdasarkan status
     * @param {string} status - Status
     * @returns {EnhancedTask[]} - Array task dengan status tertentu
     */
    findByStatus(status) {
        return this.findAll().filter(task => task.status === status);
    }
    
    /**
     * Cari task berdasarkan prioritas
     * @param {string} priority - Prioritas
     * @returns {EnhancedTask[]} - Array task dengan prioritas tertentu
     */
    findByPriority(priority) {
        return this.findAll().filter(task => task.priority === priority);
    }
    
    /**
     * Cari task yang overdue
     * @returns {EnhancedTask[]} - Array task yang overdue
     */
    findOverdue() {
        return this.findAll().filter(task => task.isOverdue);
    }
    
    /**
     * Cari task yang due dalam X hari
     * @param {number} days - Jumlah hari
     * @returns {EnhancedTask[]} - Array task yang akan due
     */
    findDueSoon(days = 3) {
        return this.findAll().filter(task => {
            const daysUntilDue = task.daysUntilDue;
            return daysUntilDue !== null && daysUntilDue <= days && daysUntilDue >= 0;
        });
    }
    
    /**
     * Cari task dengan tag tertentu
     * @param {string} tag - Tag
     * @returns {EnhancedTask[]} - Array task dengan tag
     */
    findByTag(tag) {
        return this.findAll().filter(task => task.tags.includes(tag));
    }

    /**
     * Find tasks by category
     * @param {string} category - Category to filter by
     * @returns {EnhancedTask[]} - Array of tasks in category
     */
    findByCategory(category) {
        return this.findAll().filter(task => task.category === category);
    }

    /**
     * Get task statistics by category
     * @param {string} userId - User ID (optional)
     * @returns {Object} - Statistics grouped by category
     */
    getCategoryStats(userId = null) {
        let tasks = userId ? this.findByOwner(userId) : this.findAll();
        
        const stats = {};
        const categories = EnhancedTask.getAvailableCategories();
        
        // Initialize all categories with 0
        categories.forEach(category => {
            stats[category] = {
                total: 0,
                completed: 0,
                pending: 0,
                overdue: 0
            };
        });
        
        // Count tasks in each category
        tasks.forEach(task => {
            const category = task.category;
            if (stats[category]) {
                stats[category].total++;
                
                if (task.isCompleted) {
                    stats[category].completed++;
                } else {
                    stats[category].pending++;
                }
                
                if (task.isOverdue) {
                    stats[category].overdue++;
                }
            }
        });
        
        return stats;
    }

    /**
     * Get most used categories
     * @param {string} userId - User ID (optional)
     * @param {number} limit - Number of categories to return
     * @returns {Array} - Array of categories sorted by usage
     */
    getMostUsedCategories(userId = null, limit = 5) {
        const stats = this.getCategoryStats(userId);
        
        return Object.entries(stats)
            .sort(([,a], [,b]) => b.total - a.total)
            .slice(0, limit)
            .map(([category, data]) => ({
                category,
                count: data.total,
                displayName: EnhancedTask.prototype.getCategoryDisplayName.call({ _category: category })
            }));
    }
    
    /**
     * Update task
     * @param {string} id - Task ID
     * @param {Object} updates - Data yang akan diupdate
     * @returns {EnhancedTask|null} - Task yang sudah diupdate
     */
    update(id, updates) {
        const task = this.findById(id);
        if (!task) {
            return null;
        }
        
        try {
            // Apply updates berdasarkan property yang ada
            if (updates.title !== undefined) {
                task.updateTitle(updates.title);
            }
            if (updates.description !== undefined) {
                task.updateDescription(updates.description);
            }
            if (updates.category !== undefined) {
                task.updateCategory(updates.category);
            }
            if (updates.priority !== undefined) {
                task.updatePriority(updates.priority);
            }
            if (updates.status !== undefined) {
                task.updateStatus(updates.status);
            }
            if (updates.dueDate !== undefined) {
                task.setDueDate(updates.dueDate);
            }
            if (updates.assigneeId !== undefined) {
                task.assignTo(updates.assigneeId);
            }
            if (updates.estimatedHours !== undefined) {
                task.setEstimatedHours(updates.estimatedHours);
            }
            if (updates.addTimeSpent !== undefined) {
                task.addTimeSpent(updates.addTimeSpent);
            }
            if (updates.addTag !== undefined) {
                task.addTag(updates.addTag);
            }
            if (updates.removeTag !== undefined) {
                task.removeTag(updates.removeTag);
            }
            if (updates.addNote !== undefined) {
                task.addNote(updates.addNote);
            }
            
            // Persist changes
            this._saveTasksToStorage();
            
            return task;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }
    
    /**
     * Hapus task
     * @param {string} id - Task ID
     * @returns {boolean} - Success status
     */
    delete(id) {
        if (this.tasks.has(id)) {
            this.tasks.delete(id);
            this._saveTasksToStorage();
            return true;
        }
        return false;
    }
    
    /**
     * Search task dengan query
     * @param {string} query - Search query
     * @returns {EnhancedTask[]} - Array task yang match
     */
    search(query) {
        const searchTerm = query.toLowerCase();
        return this.findAll().filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    /**
     * Filter task dengan multiple criteria
     * @param {Object} filters - Filter criteria
     * @returns {EnhancedTask[]} - Array task yang match filter
     */
    filter(filters) {
        let results = this.findAll();
        
        if (filters.ownerId) {
            results = results.filter(task => task.ownerId === filters.ownerId);
        }
        
        if (filters.assigneeId) {
            results = results.filter(task => task.assigneeId === filters.assigneeId);
        }
        
        if (filters.category) {
            results = results.filter(task => task.category === filters.category);
        }
        
        if (filters.status) {
            results = results.filter(task => task.status === filters.status);
        }
        
        if (filters.priority) {
            results = results.filter(task => task.priority === filters.priority);
        }
        
        if (filters.overdue) {
            results = results.filter(task => task.isOverdue);
        }
        
        if (filters.dueSoon) {
            results = results.filter(task => {
                const days = task.daysUntilDue;
                return days !== null && days <= 3 && days >= 0;
            });
        }
        
        if (filters.tags && filters.tags.length > 0) {
            results = results.filter(task =>
                filters.tags.some(tag => task.tags.includes(tag))
            );
        }
        
        return results;
    }
    
    /**
     * Sort task
     * @param {EnhancedTask[]} tasks - Array task untuk di-sort
     * @param {string} sortBy - Field untuk sorting
     * @param {string} order - 'asc' atau 'desc'
     * @returns {EnhancedTask[]} - Array task yang sudah di-sort
     */
    sort(tasks, sortBy = 'createdAt', order = 'desc') {
        const priorityOrder = { 
            'low': 1,
            'medium': 2,
            'high': 3,
            'urgent': 4
        };
        return tasks.sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
            case 'title':
                valueA = a.title.toLowerCase();
                valueB = b.title.toLowerCase();
                break;
            case 'priority':
                
                valueA = priorityOrder[a.priority];
                valueB = priorityOrder[b.priority];
                break;
            case 'dueDate':
                valueA = a.dueDate || new Date('9999-12-31');
                valueB = b.dueDate || new Date('9999-12-31');
                break;
            case 'createdAt':
            case 'updatedAt':
                valueA = a[sortBy];
                valueB = b[sortBy];
                break;
            default:
                valueA = a.createdAt;
                valueB = b.createdAt;
            }
            
            if (order === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
    }
    
    /**
     * Get task statistics
     * @param {string} userId - User ID (optional, untuk stats per user)
     * @returns {Object} - Task statistics
     */
    getStats(userId = null) {
        let tasks = userId ? this.findByOwner(userId) : this.findAll();
        
        const stats = {
            total: tasks.length,
            byStatus: {},
            byPriority: {},
            byCategory: {},
            overdue: tasks.filter(task => task.isOverdue).length,
            dueSoon: tasks.filter(task => {
                const days = task.daysUntilDue;
                return days !== null && days <= 3 && days >= 0;
            }).length,
            completed: tasks.filter(task => task.isCompleted).length
        };
        
        // Count by status
        ['pending', 'in-progress', 'blocked', 'completed', 'cancelled'].forEach(status => {
            stats.byStatus[status] = tasks.filter(task => task.status === status).length;
        });
        
        // Count by priority
        ['low', 'medium', 'high', 'urgent'].forEach(priority => {
            stats.byPriority[priority] = tasks.filter(task => task.priority === priority).length;
        });
        
        // Count by category
        ['work', 'personal', 'study', 'health', 'finance', 'other'].forEach(category => {
            stats.byCategory[category] = tasks.filter(task => task.category === category).length;
        });
        
        return stats;
    }
    
    // Private methods
    _loadTasksFromStorage() {
        try {
            const tasksData = this.storage.load(this.storageKey, []);
            
            tasksData.forEach(taskData => {
                try {
                    const task = EnhancedTask.fromJSON(taskData);
                    this.tasks.set(task.id, task);
                } catch (error) {
                    console.error('Error loading task:', taskData, error);
                }
            });
            
            console.log(`Loaded ${this.tasks.size} tasks from storage`);
        } catch (error) {
            console.error('Error loading tasks from storage:', error);
        }
    }
    
    _saveTasksToStorage() {
        try {
            const tasksData = Array.from(this.tasks.values()).map(task => task.toJSON());
            this.storage.save(this.storageKey, tasksData);
        } catch (error) {
            console.error('Error saving tasks to storage:', error);
        }
    }
}
