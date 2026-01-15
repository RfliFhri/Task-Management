/**
 * StorageManager - Handles data persistence using localStorage
 * 
 * Demonstrates:
 * - Separation of concerns: Data storage is separate from business logic
 * - Error handling: Graceful handling of storage failures
 * - Abstraction: Provides simple interface for complex operations
 */
export default class StorageManager {
    constructor(storageKey = 'taskManagementApp') {
        this.storageKey = storageKey;
        this.isAvailable = this._checkStorageAvailability();
    }
    
    /**
     * Save data to localStorage
     * @param {string} key - The key to store data under
     * @param {any} data - The data to store (will be JSON stringified)
     * @returns {boolean} - Success status
     */
    save(key, data) {
        if (!this.isAvailable) {
            console.warn('localStorage not available, data will not persist');
            return false;
        }
        
        try {
            const fullKey = `${this.storageKey}_${key}`;
            const jsonData = JSON.stringify(data);
            localStorage.setItem(fullKey, jsonData);
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    }
    
    /**
     * Load data from localStorage
     * @param {string} key - The key to load data from
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} - The loaded data or default value
     */
    load(key, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }
        
        try {
            const fullKey = `${this.storageKey}_${key}`;
            const jsonData = localStorage.getItem(fullKey);
            
            if (jsonData === null) {
                return defaultValue;
            }
            
            return JSON.parse(jsonData);
        } catch (error) {
            console.error('Failed to load data:', error);
            return defaultValue;
        }
    }
    
    /**
     * Remove data from localStorage
     * @param {string} key - The key to remove
     * @returns {boolean} - Success status
     */
    remove(key) {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            const fullKey = `${this.storageKey}_${key}`;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Failed to remove data:', error);
            return false;
        }
    }
    
    /**
     * Clear all app data from localStorage
     * @returns {boolean} - Success status
     */
    clear() {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            // Remove all keys that start with our storage key
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storageKey)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    }
    
    /**
     * Get storage usage information
     * @returns {object} - Storage usage stats
     */
    getStorageInfo() {
        if (!this.isAvailable) {
            return { available: false };
        }
        
        try {
            let totalSize = 0;
            let appSize = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                const itemSize = key.length + value.length;
                
                totalSize += itemSize;
                
                if (key.startsWith(this.storageKey)) {
                    appSize += itemSize;
                }
            }
            
            return {
                available: true,
                totalSize,
                appSize,
                itemCount: localStorage.length
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return { available: false, error: error.message };
        }
    }
    
    // Private helper method
    _checkStorageAvailability() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
}

