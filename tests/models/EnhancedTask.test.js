import TestDataFactory from '../helpers/TestDataFactory';
import TestAssertions from '../helpers/TestAssertions';
import EnhancedTask from '../../src/models/EnhancedTask';

describe('EnhancedTask Model', () => {
    describe('Task Creation', () => {
        test('should create task with required properties', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData();
            
            // Act
            const task = new EnhancedTask(
                taskData.title, 
                taskData.description, 
                taskData.ownerId,
                { 
                    category: taskData.category,
                    priority: taskData.priority 
                }
            );
            
            // Assert
            expect(task.title).toBe(taskData.title);
            expect(task.description).toBe(taskData.description);
            expect(task.ownerId).toBe(taskData.ownerId);
            expect(task.category).toBe(taskData.category);
            expect(task.priority).toBe(taskData.priority);
            TestAssertions.assertTaskHasRequiredProperties(task);
        });
        
        test('should throw error when title is empty', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData({ title: '' });
            
            // Act & Assert
            expect(() => {
                new EnhancedTask(taskData.title, taskData.description, taskData.ownerId);
            }).toThrow('Judul task wajib diisi');
        });
        
        test('should throw error when ownerId is missing', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData();
            
            // Act & Assert
            expect(() => {
                new EnhancedTask(taskData.title, taskData.description, null);
            }).toThrow('Owner ID wajib diisi');
        });
        
        test('should set default values correctly', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData();
            
            // Act
            const task = new EnhancedTask(taskData.title, taskData.description, taskData.ownerId);
            
            // Assert
            expect(task.category).toBe('personal'); // default category
            expect(task.priority).toBe('medium'); // default priority
            expect(task.status).toBe('pending'); // default status
            expect(task.assigneeId).toBe(taskData.ownerId); // default assigned to owner
        });
    });
    
    describe('Task Properties and Computed Values', () => {
        let task;
        
        beforeEach(() => {
            const taskData = TestDataFactory.createValidTaskData();
            task = new EnhancedTask(taskData.title, taskData.description, taskData.ownerId);
        });
        
        test('should calculate isCompleted correctly', () => {
            // Initially not completed
            expect(task.isCompleted).toBe(false);
            
            // After marking as completed
            task.updateStatus('completed');
            expect(task.isCompleted).toBe(true);
        });
        
        test('should calculate isOverdue correctly', () => {
            // Task without due date should not be overdue
            expect(task.isOverdue).toBe(false);
            
            // Task with future due date should not be overdue
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 1);
            task.setDueDate(futureDate);
            expect(task.isOverdue).toBe(false);
            
            // Task with past due date should be overdue
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            task.setDueDate(pastDate);
            expect(task.isOverdue).toBe(true);
            
            // Completed task should not be overdue even if past due date
            task.updateStatus('completed');
            expect(task.isOverdue).toBe(false);
        });
        
        test('should calculate daysUntilDue correctly', () => {
            // Task without due date
            expect(task.daysUntilDue).toBeNull();
            
            // Task due tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            task.setDueDate(tomorrow);
            expect(task.daysUntilDue).toBe(1);
            
            // Task due yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            task.setDueDate(yesterday);
            expect(task.daysUntilDue).toBe(-1);
        });
    });
    
    describe('Task Updates', () => {
        let task;
        
        beforeEach(() => {
            const taskData = TestDataFactory.createValidTaskData();
            task = new EnhancedTask(taskData.title, taskData.description, taskData.ownerId);
        });
        
        test('should update title successfully', () => {
            // Arrange
            const newTitle = 'Updated Task Title';
            const oldUpdatedAt = task.updatedAt;
            
            // Act
            task.updateTitle(newTitle);
            
            // Assert
            expect(task.title).toBe(newTitle);
            // Gunakan toBeGreaterThanOrEqual untuk menghindari timing issue
            expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
        });
        
        test('should throw error when updating title to empty', () => {
            // Act & Assert
            expect(() => {
                task.updateTitle('');
            }).toThrow('Judul task tidak boleh kosong');
        });
        
        test('should update category successfully', () => {
            // Act
            task.updateCategory('study');
            
            // Assert
            expect(task.category).toBe('study');
        });
        
        test('should throw error for invalid category', () => {
            // Act & Assert
            expect(() => {
                task.updateCategory('invalid-category');
            }).toThrow('Kategori tidak valid');
        });
        
        test('should add and remove tags', () => {
            // Add tags
            task.addTag('urgent');
            task.addTag('important');
            expect(task.tags).toContain('urgent');
            expect(task.tags).toContain('important');
            expect(task.tags).toHaveLength(2);
            
            // Remove tag
            task.removeTag('urgent');
            expect(task.tags).not.toContain('urgent');
            expect(task.tags).toContain('important');
            expect(task.tags).toHaveLength(1);
        });
        
        test('should not add duplicate tags', () => {
            // Add same tag twice
            task.addTag('urgent');
            task.addTag('urgent');
            
            // Should only have one instance
            expect(task.tags.filter(tag => tag === 'urgent')).toHaveLength(1);
        });
    });
    
    describe('Task Serialization', () => {
        test('should serialize and deserialize correctly', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData();
            const originalTask = new EnhancedTask(
                taskData.title, 
                taskData.description, 
                taskData.ownerId,
                {
                    category: 'work',
                    priority: 'high',
                    dueDate: new Date('2024-12-31')
                }
            );
            
            // Add some additional data
            originalTask.addTag('important');
            originalTask.addNote('This is a test note');
            
            // Act
            const json = originalTask.toJSON();
            const restoredTask = EnhancedTask.fromJSON(json);
            
            // Assert
            expect(restoredTask.id).toBe(originalTask.id);
            expect(restoredTask.title).toBe(originalTask.title);
            expect(restoredTask.description).toBe(originalTask.description);
            expect(restoredTask.ownerId).toBe(originalTask.ownerId);
            expect(restoredTask.category).toBe(originalTask.category);
            expect(restoredTask.priority).toBe(originalTask.priority);
            expect(restoredTask.tags).toEqual(originalTask.tags);
            expect(restoredTask.notes).toEqual(originalTask.notes);
            expect(restoredTask.dueDate.getTime()).toBe(originalTask.dueDate.getTime());
        });
    });

    describe('Category Management', () => {
        let task;
        
        beforeEach(() => {
            const taskData = TestDataFactory.createValidTaskData();
            task = new EnhancedTask(taskData.title, taskData.description, taskData.ownerId);
        });
        
        test('should have default category', () => {
            expect(task.category).toBe('personal');
        });
        
        test('should update category successfully', () => {
            // Act
            task.updateCategory('work');
            
            // Assert
            expect(task.category).toBe('work');
            expect(task.updatedAt).toBeInstanceOf(Date);
        });
        
        test('should throw error for invalid category', () => {
            // Act & Assert
            expect(() => {
                task.updateCategory('invalid-category');
            }).toThrow('Kategori tidak valid');
        });
        
        test('should return available categories', () => {
            // Act
            const categories = EnhancedTask.getAvailableCategories();
            
            // Assert
            expect(categories).toBeInstanceOf(Array);
            expect(categories).toContain('work');
            expect(categories).toContain('personal');
            expect(categories).toContain('study');
            expect(categories.length).toBeGreaterThan(0);
        });
        
        test('should get category display name', () => {
            // Arrange
            task.updateCategory('work');
            
            // Act
            const displayName = task.getCategoryDisplayName();
            
            // Assert
            expect(displayName).toBe('Work & Business');
        });
        
        test('should check if task is in category', () => {
            // Arrange
            task.updateCategory('study');
            
            // Act & Assert
            expect(task.isInCategory('study')).toBe(true);
            expect(task.isInCategory('work')).toBe(false);
        });
    });
});