/**
 * Task Model - Represents a single task in our system
 * 
 * Demonstrates:
 * - Encapsulation: Private data with public methods
 * - Data validation: Ensuring data integrity
 * - Business logic: Task-specific operations
 */
export default class Task {
    constructor(title, description, priority = 'medium') {
        // Validate required fields
        if (!title || title.trim() === '') {
            throw new Error('Task title is required');
        }
        
        // Private properties (using convention)
        this._id = this._generateId();
        this._title = title.trim();
        this._description = description ? description.trim() : '';
        this._priority = this._validatePriority(priority);
        this._completed = false;
        this._createdAt = new Date();
        this._updatedAt = new Date();
    }
    
    // Public getters (read-only access)
    get id() { return this._id; }
    get title() { return this._title; }
    get description() { return this._description; }
    get priority() { return this._priority; }
    get completed() { return this._completed; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    
    // Public methods for task operations
    markComplete() {
        this._completed = true;
        this._updatedAt = new Date();
    }
    
    markIncomplete() {
        this._completed = false;
        this._updatedAt = new Date();
    }
    
    updateTitle(newTitle) {
        if (!newTitle || newTitle.trim() === '') {
            throw new Error('Task title cannot be empty');
        }
        this._title = newTitle.trim();
        this._updatedAt = new Date();
    }
    
    updateDescription(newDescription) {
        this._description = newDescription ? newDescription.trim() : '';
        this._updatedAt = new Date();
    }
    
    updatePriority(newPriority) {
        this._priority = this._validatePriority(newPriority);
        this._updatedAt = new Date();
    }
    
    // Convert to plain object for storage/serialization
    toJSON() {
        return {
            id: this._id,
            title: this._title,
            description: this._description,
            priority: this._priority,
            completed: this._completed,
            createdAt: this._createdAt.toISOString(),
            updatedAt: this._updatedAt.toISOString()
        };
    }
    
    // Create Task from stored data
    static fromJSON(data) {
        const task = new Task(data.title, data.description, data.priority);
        task._id = data.id;
        task._completed = data.completed;
        task._createdAt = new Date(data.createdAt);
        task._updatedAt = new Date(data.updatedAt);
        return task;
    }
    
    // Private helper methods
    _generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    _validatePriority(priority) {
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
            throw new Error(`Invalid priority: ${priority}. Must be one of: ${validPriorities.join(', ')}`);
        }
        return priority;
    }
}
