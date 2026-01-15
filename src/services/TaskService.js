// eslint-disable-next-line quotes
import Task from "../models/Task";
/**
 * TaskService - Business logic layer for task management
 * 
 * Demonstrates:
 * - Business logic separation: All task operations in one place
 * - Data coordination: Manages interaction between models and storage
 * - Event handling: Notifies other parts of the system about changes
 */
export default class TaskService {
    constructor(storageManager) {
        this.storage = storageManager;
        this.tasks = new Map(); // In-memory cache for better performance
        this.listeners = new Set(); // For event notifications
        
        // Load existing tasks from storage
        this._loadTasksFromStorage();
    }
    
    /**
     * Create a new task
     * @param {string} title - Task title
     * @param {string} description - Task description
     * @param {string} priority - Task priority (low, medium, high)
     * @returns {Task} - The created task
     */
    createTask(title, description, priority) {
        try {
            // Create new task (validation happens in constructor)
            const task = new Task(title, description, priority);
            
            // Add to in-memory cache
            this.tasks.set(task.id, task);
            
            // Persist to storage
            this._saveTasksToStorage();
            
            // Notify listeners
            this._notifyListeners('taskCreated', task);
            
            return task;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    }
    
    /**
     * Get all tasks
     * @returns {Task[]} - Array of all tasks
     */
    getAllTasks() {
        return Array.from(this.tasks.values());
    }
    
    /**
     * Get task by ID
     * @param {string} id - Task ID
     * @returns {Task|null} - The task or null if not found
     */
    getTaskById(id) {
        return this.tasks.get(id) || null;
    }
    
    /**
     * Update a task
     * @param {string} id - Task ID
     * @param {object} updates - Object with properties to update
     * @returns {Task|null} - The updated task or null if not found
     */
    updateTask(id, updates) {
        const task = this.tasks.get(id);
        if (!task) {
            return null;
        }
        
        try {
            // Apply updates
            if (updates.title !== undefined) {
                task.updateTitle(updates.title);
            }
            if (updates.description !== undefined) {
                task.updateDescription(updates.description);
            }
            if (updates.priority !== undefined) {
                task.updatePriority(updates.priority);
            }
            if (updates.completed !== undefined) {
                if (updates.completed) {
                    task.markComplete();
                } else {
                    task.markIncomplete();
                }
            }
            
            // Persist changes
            this._saveTasksToStorage();
            
            // Notify listeners
            this._notifyListeners('taskUpdated', task);
            
            return task;
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    }
    
    /**
     * Delete a task
     * @param {string} id - Task ID
     * @returns {boolean} - Success status
     */
    deleteTask(id) {
        const task = this.tasks.get(id);
        if (!task) {
            return false;
        }
        
        // Remove from cache
        this.tasks.delete(id);
        
        // Persist changes
        this._saveTasksToStorage();
        
        // Notify listeners
        this._notifyListeners('taskDeleted', task);
        
        return true;
    }
    
    /**
     * Get tasks filtered by completion status
     * @param {boolean} completed - Filter by completion status
     * @returns {Task[]} - Filtered tasks
     */
    getTasksByStatus(completed) {
        return this.getAllTasks().filter(task => task.completed === completed);
    }
    
    /**
     * Get tasks filtered by priority
     * @param {string} priority - Priority level
     * @returns {Task[]} - Filtered tasks
     */
    getTasksByPriority(priority) {
        return this.getAllTasks().filter(task => task.priority === priority);
    }
    
    /**
     * Get task statistics
     * @returns {object} - Task statistics
     */
    getTaskStats() {
        const allTasks = this.getAllTasks();
        const completed = allTasks.filter(task => task.completed);
        const pending = allTasks.filter(task => !task.completed);
        
        const byPriority = {
            high: allTasks.filter(task => task.priority === 'high').length,
            medium: allTasks.filter(task => task.priority === 'medium').length,
            low: allTasks.filter(task => task.priority === 'low').length
        };
        
        return {
            total: allTasks.length,
            completed: completed.length,
            pending: pending.length,
            byPriority
        };
    }
    
    /**
     * Add event listener for task changes
     * @param {function} listener - Callback function
     */
    addListener(listener) {
        this.listeners.add(listener);
    }
    
    /**
     * Remove event listener
     * @param {function} listener - Callback function to remove
     */
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    
    /**
     * Clear all tasks
     * @returns {boolean} - Success status
     */
    clearAllTasks() {
        this.tasks.clear();
        this._saveTasksToStorage();
        this._notifyListeners('allTasksCleared');
        return true;
    }
    
    // Private methods
    _loadTasksFromStorage() {
        const tasksData = this.storage.load('tasks', []);
        
        tasksData.forEach(taskData => {
            try {
                const task = Task.fromJSON(taskData);
                this.tasks.set(task.id, task);
            } catch (error) {
                console.error('Failed to load task:', taskData, error);
            }
        });
    }
    
    _saveTasksToStorage() {
        const tasksData = this.getAllTasks().map(task => task.toJSON());
        this.storage.save('tasks', tasksData);
    }
    
    _notifyListeners(eventType, data) {
        this.listeners.forEach(listener => {
            try {
                listener(eventType, data);
            } catch (error) {
                console.error('Error in task service listener:', error);
            }
        });
    }
}
