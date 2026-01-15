import {jest} from '@jest/globals';
/**
 * Test Data Factory - Helper untuk membuat test data
 * 
 * Kenapa perlu?
 * - Konsistensi: Semua test pakai data yang sama
 * - DRY: Tidak repeat kode yang sama
 * - Maintainability: Kalau format data berubah, cukup ubah di satu tempat
 */
export default class TestDataFactory {
    /**
     * Buat data user yang valid untuk testing
     */
    static createValidUserData(overrides = {}) {
        return {
            username: 'testuser',
            email: 'test@example.com',
            fullName: 'Test User',
            ...overrides
        };
    }
    
    /**
     * Buat data task yang valid untuk testing
     */
    static createValidTaskData(overrides = {}) {
        return {
            title: 'Test Task',
            description: 'Test Description',
            ownerId: 'user123',
            category: 'work',
            priority: 'medium',
            ...overrides
        };
    }
    
    /**
     * Buat multiple tasks untuk testing
     */
    static createMultipleTasks(count = 3, baseData = {}) {
        return Array.from({ length: count }, (_, i) => 
            this.createValidTaskData({
                title: `Task ${i + 1}`,
                priority: ['low', 'medium', 'high'][i % 3],
                ...baseData
            })
        );
    }
    
    /**
     * Buat mock storage untuk testing
     */
    static createMockStorage() {
        const storage = new Map();
        
        return {
            save: jest.fn((key, data) => {
                storage.set(key, JSON.stringify(data));
                return true;
            }),
            load: jest.fn((key, defaultValue = null) => {
                const data = storage.get(key);
                return data ? JSON.parse(data) : defaultValue;
            }),
            remove: jest.fn((key) => {
                storage.delete(key);
                return true;
            }),
            clear: jest.fn(() => {
                storage.clear();
                return true;
            })
        };
    }
}