/**
 * Enhanced Task Model - Task dengan fitur tambahan untuk Day 2
 * 
 * Fitur baru:
 * - Multi-user support (owner dan assignee)
 * - Categories dan tags
 * - Due dates dengan overdue detection
 * - Status yang lebih detail
 * - Time tracking
 */
export default class EnhancedTask {
    constructor(title, description, ownerId, options = {}) {
        // Validasi input
        if (!title || title.trim() === '') {
            throw new Error('Judul task wajib diisi');
        }
        
        if (!ownerId) {
            throw new Error('Owner ID wajib diisi');
        }
        
        // Properties dasar
        this._id = this._generateId();
        this._title = title.trim();
        this._description = description ? description.trim() : '';
        this._ownerId = ownerId;
        this._assigneeId = options.assigneeId || ownerId; // default assigned to owner
        
        // Properties baru untuk Day 2
        this._category = this._validateCategory(options.category || 'personal');
        this._tags = Array.isArray(options.tags) ? options.tags : [];
        this._priority = this._validatePriority(options.priority || 'medium');
        this._status = this._validateStatus(options.status || 'pending');
        
        // Date properties
        this._dueDate = options.dueDate ? new Date(options.dueDate) : null;
        this._createdAt = new Date();
        this._updatedAt = new Date();
        this._completedAt = null;
        
        // Time tracking
        this._estimatedHours = options.estimatedHours || 0;
        this._actualHours = 0;
        
        // Additional metadata
        this._notes = [];
        this._attachments = [];
    }
    
    // Getter methods
    get id() { return this._id; }
    get title() { return this._title; }
    get description() { return this._description; }
    get ownerId() { return this._ownerId; }
    get assigneeId() { return this._assigneeId; }
    get category() { return this._category; }
    get tags() { return [...this._tags]; } // return copy
    get priority() { return this._priority; }
    get status() { return this._status; }
    get dueDate() { return this._dueDate; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    get completedAt() { return this._completedAt; }
    get estimatedHours() { return this._estimatedHours; }
    get actualHours() { return this._actualHours; }
    get notes() { return [...this._notes]; }
    get attachments() { return [...this._attachments]; }
    
    // Computed properties (properties yang dihitung)
    get isCompleted() {
        return this._status === 'completed';
    }
    
    get isOverdue() {
        if (!this._dueDate || this.isCompleted) return false;
        return new Date() > this._dueDate;
    }
    
    get daysUntilDue() {
        if (!this._dueDate) return null;
        const today = new Date();
        const diffTime = this._dueDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    get progressPercentage() {
        if (this._estimatedHours === 0) return 0;
        return Math.min(100, (this._actualHours / this._estimatedHours) * 100);
    }
    
    // Public methods untuk operasi task
    updateTitle(newTitle) {
        if (!newTitle || newTitle.trim() === '') {
            throw new Error('Judul task tidak boleh kosong');
        }
        this._title = newTitle.trim();
        this._updateTimestamp();
    }
    
    updateDescription(newDescription) {
        this._description = newDescription ? newDescription.trim() : '';
        this._updateTimestamp();
    }
    
    updateCategory(newCategory) {
        this._category = this._validateCategory(newCategory);
        this._updateTimestamp();
    }
    
    addTag(tag) {
        if (tag && !this._tags.includes(tag)) {
            this._tags.push(tag);
            this._updateTimestamp();
        }
    }
    
    removeTag(tag) {
        const index = this._tags.indexOf(tag);
        if (index > -1) {
            this._tags.splice(index, 1);
            this._updateTimestamp();
        }
    }
    
    updatePriority(newPriority) {
        this._priority = this._validatePriority(newPriority);
        this._updateTimestamp();
    }
    
    updateStatus(newStatus) {
        const oldStatus = this._status;
        this._status = this._validateStatus(newStatus);
        
        // Set completed timestamp jika status berubah ke completed
        if (newStatus === 'completed' && oldStatus !== 'completed') {
            this._completedAt = new Date();
        } else if (newStatus !== 'completed') {
            this._completedAt = null;
        }
        
        this._updateTimestamp();
    }
    
    setDueDate(dueDate) {
        this._dueDate = dueDate ? new Date(dueDate) : null;
        this._updateTimestamp();
    }
    
    assignTo(userId) {
        this._assigneeId = userId;
        this._updateTimestamp();
    }
    
    addTimeSpent(hours) {
        if (hours > 0) {
            this._actualHours += hours;
            this._updateTimestamp();
        }
    }
    
    setEstimatedHours(hours) {
        this._estimatedHours = Math.max(0, hours);
        this._updateTimestamp();
    }
    
    addNote(note) {
        if (note && note.trim()) {
            this._notes.push({
                id: Date.now(),
                content: note.trim(),
                createdAt: new Date()
            });
            this._updateTimestamp();
        }
    }


    /**
     * Update task category
     * @param {string} newCategory - New category
     */
    updateCategory(newCategory) {
        this._category = this._validateCategory(newCategory);
        this._updateTimestamp();
    }

    /**
     * Get available categories (static method)
     * @returns {string[]} - Array of valid categories
     */
    static getAvailableCategories() {
        return ['work', 'personal', 'study', 'health', 'finance', 'shopping', 'other'];
    }

    /**
     * Get category display name
     * @returns {string} - Formatted category name
     */
    getCategoryDisplayName() {
        const categoryNames = {
            'work': 'Work & Business',
            'personal': 'Personal',
            'study': 'Study & Learning',
            'health': 'Health & Fitness',
            'finance': 'Finance & Money',
            'shopping': 'Shopping',
            'other': 'Other'
        };
        
        return categoryNames[this._category] || this._category;
    }

    /**
     * Check if task belongs to specific category
     * @param {string} category - Category to check
     * @returns {boolean} - True if task is in category
     */
    isInCategory(category) {
        return this._category === category;
    }
    
    
    // Convert ke JSON untuk penyimpanan
    toJSON() {
        return {
            id: this._id,
            title: this._title,
            description: this._description,
            ownerId: this._ownerId,
            assigneeId: this._assigneeId,
            category: this._category,
            tags: this._tags,
            priority: this._priority,
            status: this._status,
            dueDate: this._dueDate ? this._dueDate.toISOString() : null,
            createdAt: this._createdAt.toISOString(),
            updatedAt: this._updatedAt.toISOString(),
            completedAt: this._completedAt ? this._completedAt.toISOString() : null,
            estimatedHours: this._estimatedHours,
            actualHours: this._actualHours,
            notes: this._notes,
            attachments: this._attachments
        };
    }
    
    // Create Task dari data JSON
    static fromJSON(data) {
        const ownerId = data.ownerId ?? 'legacy-user';
        const task = new EnhancedTask(data.title, data.description, ownerId, {
            assigneeId: data.assigneeId,
            category: data.category,
            tags: data.tags,
            priority: data.priority,
            status: data.status,
            dueDate: data.dueDate,
            estimatedHours: data.estimatedHours
        });
        
        task._id = data.id;
        task._createdAt = new Date(data.createdAt);
        task._updatedAt = new Date(data.updatedAt);
        task._completedAt = data.completedAt ? new Date(data.completedAt) : null;
        task._actualHours = data.actualHours || 0;
        task._notes = data.notes || [];
        task._attachments = data.attachments || [];
        
        return task;
    }
    
    // Private helper methods
    _generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    _updateTimestamp() {
        this._updatedAt = new Date();
    }
    
    _validateCategory(category) {
        const validCategories = ['work', 'personal', 'study', 'health', 'finance', 'other'];
        if (!validCategories.includes(category)) {
            throw new Error(`Kategori tidak valid: ${category}. Harus salah satu dari: ${validCategories.join(', ')}`);
        }
        return category;
    }
    
    _validatePriority(priority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
            throw new Error(`Prioritas tidak valid: ${priority}. Harus salah satu dari: ${validPriorities.join(', ')}`);
        }
        return priority;
    }
    
    _validateStatus(status) {
        const validStatuses = ['pending', 'in-progress', 'blocked', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Status tidak valid: ${status}. Harus salah satu dari: ${validStatuses.join(', ')}`);
        }
        return status;
    }
}
