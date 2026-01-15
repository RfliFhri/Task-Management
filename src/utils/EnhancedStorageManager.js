/**
 * Enhanced Storage Manager - Storage dengan multi-entity support
 * 
 * Improvements dari Day 1:
 * - Support multiple entities (users, tasks, settings)
 * - Better error handling
 * - Data migration support
 * - Backup dan restore functionality
 */
export default class EnhancedStorageManager {
    constructor(appName = 'taskManagementApp', version = '2.0') {
        this.appName = appName;
        this.version = version;
        this.isAvailable = this._checkStorageAvailability();
        
        // Initialize app metadata
        this._initializeApp();
    }
    
    /**
     * Save data untuk entity tertentu
     * @param {string} entity - Entity name (users, tasks, settings)
     * @param {any} data - Data to save
     * @returns {boolean} - Success status
     */
    save(entity, data) {
        if (!this.isAvailable) {
            console.warn('localStorage not available, data will not persist');
            return false;
        }
        
        try {
            const key = this._getKey(entity);
            const dataToSave = {
                data: data,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            
            localStorage.setItem(key, JSON.stringify(dataToSave));
            
            // Update metadata
            this._updateMetadata(entity, dataToSave.timestamp);
            
            return true;
        } catch (error) {
            console.error(`Failed to save ${entity}:`, error);
            return false;
        }
    }
    
    /**
     * Load data untuk entity tertentu
     * @param {string} entity - Entity name
     * @param {any} defaultValue - Default value jika tidak ada data
     * @returns {any} - Loaded data atau default value
     */
    load(entity, defaultValue = null) {
        if (!this.isAvailable) {
            return defaultValue;
        }
        
        try {
            const key = this._getKey(entity);
            const storedData = localStorage.getItem(key);
            
            if (!storedData) {
                return defaultValue;
            }
            
            const parsedData = JSON.parse(storedData);
            
            // Check version compatibility
            if (parsedData.version && parsedData.version !== this.version) {
                console.warn(`Version mismatch for ${entity}: stored=${parsedData.version}, current=${this.version}`);
                // Bisa implement migration logic di sini
            }
            
            return parsedData.data;
        } catch (error) {
            console.error(`Failed to load ${entity}:`, error);
            return defaultValue;
        }
    }
    
    /**
     * Remove data untuk entity tertentu
     * @param {string} entity - Entity name
     * @returns {boolean} - Success status
     */
    remove(entity) {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            const key = this._getKey(entity);
            localStorage.removeItem(key);
            
            // Update metadata
            this._removeFromMetadata(entity);
            
            return true;
        } catch (error) {
            console.error(`Failed to remove ${entity}:`, error);
            return false;
        }
    }
    
    /**
     * Clear semua data aplikasi
     * @returns {boolean} - Success status
     */
    clear() {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            const keysToRemove = [];
            
            // Find all keys yang belong ke app ini
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.appName)) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove all keys
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            return true;
        } catch (error) {
            console.error('Failed to clear app data:', error);
            return false;
        }
    }
    
    /**
     * Export semua data aplikasi
     * @returns {Object|null} - Exported data atau null jika gagal
     */
    exportData() {
        if (!this.isAvailable) {
            return null;
        }
        
        try {
            const exportData = {
                appName: this.appName,
                version: this.version,
                exportedAt: new Date().toISOString(),
                data: {}
            };
            
            // Get all app keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.appName)) {
                    const value = localStorage.getItem(key);
                    exportData.data[key] = JSON.parse(value);
                }
            }
            
            return exportData;
        } catch (error) {
            console.error('Failed to export data:', error);
            return null;
        }
    }
    
    /**
     * Import data ke aplikasi
     * @param {Object} importData - Data yang akan diimport
     * @returns {boolean} - Success status
     */
    importData(importData) {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            // Validasi format import data
            if (!importData.appName || !importData.data) {
                throw new Error('Invalid import data format');
            }
            
            // Warning jika app name berbeda
            if (importData.appName !== this.appName) {
                console.warn(`Importing data from different app: ${importData.appName}`);
            }
            
            // Import each key
            Object.keys(importData.data).forEach(key => {
                localStorage.setItem(key, JSON.stringify(importData.data[key]));
            });
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
    
    /**
     * Get storage usage info
     * @returns {Object} - Storage usage information
     */
    getStorageInfo() {
        if (!this.isAvailable) {
            return { available: false };
        }
        
        try {
            let totalSize = 0;
            let appSize = 0;
            let appKeys = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                const itemSize = key.length + value.length;
                
                totalSize += itemSize;
                
                if (key.startsWith(this.appName)) {
                    appSize += itemSize;
                    appKeys++;
                }
            }
            
            return {
                available: true,
                totalSize,
                appSize,
                appKeys,
                totalKeys: localStorage.length,
                usagePercentage: totalSize > 0 ? (appSize / totalSize * 100).toFixed(2) : 0
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return { available: false, error: error.message };
        }
    }
    
    /**
     * Get app metadata
     * @returns {Object} - App metadata
     */
    getMetadata() {
        return this.load('_metadata', {
            version: this.version,
            createdAt: new Date().toISOString(),
            entities: {}
        });
    }
    
    /**
     * Check if entity exists
     * @param {string} entity - Entity name
     * @returns {boolean} - Existence status
     */
    exists(entity) {
        if (!this.isAvailable) {
            return false;
        }
        
        const key = this._getKey(entity);
        return localStorage.getItem(key) !== null;
    }
    
    /**
     * Get all entity names
     * @returns {string[]} - Array of entity names
     */
    getEntities() {
        if (!this.isAvailable) {
            return [];
        }
        
        const entities = [];
        const prefix = this.appName + '_';
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                const entity = key.substring(prefix.length);
                if (entity !== '_metadata') {
                    entities.push(entity);
                }
            }
        }
        
        return entities;
    }
    
    // Private methods
    _getKey(entity) {
        return `${this.appName}_${entity}`;
    }
    
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
    
    _initializeApp() {
        if (!this.exists('_metadata')) {
            this.save('_metadata', {
                version: this.version,
                createdAt: new Date().toISOString(),
                entities: {}
            });
        }
    }
    
    _updateMetadata(entity, timestamp) {
        const metadata = this.getMetadata();
        metadata.entities[entity] = {
            lastUpdated: timestamp,
            version: this.version
        };
        this.save('_metadata', metadata);
    }
    
    _removeFromMetadata(entity) {
        const metadata = this.getMetadata();
        delete metadata.entities[entity];
        this.save('_metadata', metadata);
    }
}
