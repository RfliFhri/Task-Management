import TestDataFactory from '../helpers/TestDataFactory';
import TestAssertions from '../helpers/TestAssertions';
import TaskController from '../../src/controllers/TaskController';
import TaskRepository from '../../src/repositories/TaskRepository';
import UserRepository from '../../src/repositories/UserRepository';

describe('TaskController', () => {
    let taskController;
    let taskRepository;
    let userRepository;
    let mockStorage;
    let testUser;
    
    beforeEach(() => {
        // Setup complete system untuk integration testing
        mockStorage = TestDataFactory.createMockStorage();
        taskRepository = new TaskRepository(mockStorage);
        userRepository = new UserRepository(mockStorage);
        taskController = new TaskController(taskRepository, userRepository);
        
        // Create test user dan set sebagai current user
        const userData = TestDataFactory.createValidUserData();
        testUser = userRepository.create(userData);
        taskController.setCurrentUser(testUser.id);
    });
    
    describe('Task Creation', () => {
        test('should create task successfully', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData();
            
            // Act
            const response = taskController.createTask(taskData);
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data.title).toBe(taskData.title);
            expect(response.data.ownerId).toBe(testUser.id);
            expect(response.message).toContain('berhasil dibuat');
        });
        
        test('should fail when user not logged in', () => {
            // Arrange
            taskController.currentUser = null; // Simulate logout
            const taskData = TestDataFactory.createValidTaskData();
            
            // Act
            const response = taskController.createTask(taskData);
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('User harus login terlebih dahulu');
        });
        
        test('should fail when title is empty', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData({ title: '' });
            
            // Act
            const response = taskController.createTask(taskData);
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Judul task wajib diisi');
        });
        
        test('should fail when assignee does not exist', () => {
            // Arrange
            const taskData = TestDataFactory.createValidTaskData({ 
                assigneeId: 'non-existent-user' 
            });
            
            // Act
            const response = taskController.createTask(taskData);
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('User yang di-assign tidak ditemukan');
        });
    });
    
    describe('Task Retrieval', () => {
        let testTask;
        
        beforeEach(() => {
            // Create test task
            const taskData = TestDataFactory.createValidTaskData();
            const createResponse = taskController.createTask(taskData);
            testTask = createResponse.data;
        });
        
        test('should get all user tasks', () => {
            // Act
            const response = taskController.getTasks();
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data).toHaveLength(1);
            expect(response.data[0].id).toBe(testTask.id);
            expect(response.count).toBe(1);
        });
        
        test('should get task by ID', () => {
            // Act
            const response = taskController.getTask(testTask.id);
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data.id).toBe(testTask.id);
            expect(response.data.title).toBe(testTask.title);
        });
        
        test('should fail to get non-existent task', () => {
            // Act
            const response = taskController.getTask('non-existent-id');
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Task tidak ditemukan');
        });
        
        test('should filter tasks by status', () => {
            // Arrange - create completed task
            const completedTaskData = TestDataFactory.createValidTaskData({ 
                title: 'Completed Task' 
            });
            const completedResponse = taskController.createTask(completedTaskData);
            taskController.updateTask(completedResponse.data.id, { status: 'completed' });
            
            // Act
            const pendingResponse = taskController.getTasks({ status: 'pending' });
            const completedResponse2 = taskController.getTasks({ status: 'completed' });
            
            // Assert
            expect(pendingResponse.data).toHaveLength(1);
            expect(completedResponse2.data).toHaveLength(1);
            expect(pendingResponse.data[0].status).toBe('pending');
            expect(completedResponse2.data[0].status).toBe('completed');
        });
    });
    
    describe('Task Updates', () => {
        let testTask;
        
        beforeEach(() => {
            const taskData = TestDataFactory.createValidTaskData();
            const createResponse = taskController.createTask(taskData);
            testTask = createResponse.data;
        });
        
        test('should update task successfully', () => {
            // Arrange
            const updates = {
                title: 'Updated Title',
                priority: 'high',
                status: 'in-progress'
            };
            
            // Act
            const response = taskController.updateTask(testTask.id, updates);
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data.title).toBe(updates.title);
            expect(response.data.priority).toBe(updates.priority);
            expect(response.data.status).toBe(updates.status);
        });
        
        test('should fail to update non-existent task', () => {
            // Act
            const response = taskController.updateTask('non-existent-id', { title: 'Test' });
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Task tidak ditemukan');
        });
        
        test('should toggle task status', () => {
            // Initially pending
            expect(testTask.status).toBe('pending');
            
            // Toggle to completed
            const response1 = taskController.toggleTaskStatus(testTask.id);
            TestAssertions.assertControllerResponse(response1, true);
            expect(response1.data.status).toBe('completed');
            
            // Toggle back to pending
            const response2 = taskController.toggleTaskStatus(testTask.id);
            TestAssertions.assertControllerResponse(response2, true);
            expect(response2.data.status).toBe('pending');
        });
    });
    
    describe('Task Deletion', () => {
        let testTask;
        
        beforeEach(() => {
            const taskData = TestDataFactory.createValidTaskData();
            const createResponse = taskController.createTask(taskData);
            testTask = createResponse.data;
        });
        
        test('should delete task successfully', () => {
            // Act
            const response = taskController.deleteTask(testTask.id);
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.message).toContain('berhasil dihapus');
            
            // Verify task is deleted
            const getResponse = taskController.getTask(testTask.id);
            TestAssertions.assertControllerResponse(getResponse, false);
        });
        
        test('should fail to delete non-existent task', () => {
            // Act
            const response = taskController.deleteTask('non-existent-id');
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Task tidak ditemukan');
        });
    });
    
    describe('Task Search and Statistics', () => {
        beforeEach(() => {
            // Create multiple tasks for testing
            const tasks = TestDataFactory.createMultipleTasks(3);
            tasks.forEach(taskData => taskController.createTask(taskData));
        });
        
        test('should search tasks', () => {
            // Act
            const response = taskController.searchTasks('Task 1');
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data).toHaveLength(1);
            expect(response.data[0].title).toBe('Task 1');
            expect(response.query).toBe('Task 1');
        });
        
        test('should fail search with empty query', () => {
            // Act
            const response = taskController.searchTasks('');
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Query pencarian tidak boleh kosong');
        });
        
        test('should get task statistics', () => {
            // Act
            const response = taskController.getTaskStats();
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data).toHaveProperty('total');
            expect(response.data).toHaveProperty('byStatus');
            expect(response.data).toHaveProperty('byPriority');
            expect(response.data.total).toBe(3);
        });
    });
    
    describe('Permission Testing', () => {
        let otherUser;
        let otherUserTask;
        
        beforeEach(() => {
            // Create another user dan task
            const otherUserData = TestDataFactory.createValidUserData({
                username: 'otheruser',
                email: 'other@example.com'
            });
            otherUser = userRepository.create(otherUserData);
            
            // Create task as other user
            taskController.setCurrentUser(otherUser.id);
            const taskData = TestDataFactory.createValidTaskData();
            const createResponse = taskController.createTask(taskData);
            otherUserTask = createResponse.data;
            
            // Switch back to original user
            taskController.setCurrentUser(testUser.id);
        });
        
        test('should not allow access to other user task', () => {
            // Act
            const response = taskController.getTask(otherUserTask.id);
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Anda tidak memiliki akses ke task ini');
        });
        
        test('should not allow updating other user task', () => {
            // Act
            const response = taskController.updateTask(otherUserTask.id, { title: 'Hacked' });
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Hanya owner yang bisa mengubah task');
        });
        
        test('should not allow deleting other user task', () => {
            // Act
            const response = taskController.deleteTask(otherUserTask.id);
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Hanya owner yang bisa menghapus task');
        });
    });

    describe('Category Management', () => {
        let testTask;
        
        beforeEach(() => {
            const taskData = TestDataFactory.createValidTaskData({ category: 'work' });
            const createResponse = taskController.createTask(taskData);
            testTask = createResponse.data;
        });
        
        test('should get tasks by category', () => {
            // Act
            const response = taskController.getTasksByCategory('work');
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data).toHaveLength(1);
            expect(response.data[0].category).toBe('work');
            expect(response.category).toBe('work');
            expect(response.categoryDisplayName).toBe('Work & Business');
        });
        
        test('should fail with invalid category', () => {
            // Act
            const response = taskController.getTasksByCategory('invalid');
            
            // Assert
            TestAssertions.assertControllerResponse(response, false);
            expect(response.error).toBe('Kategori tidak valid');
        });
        
        test('should get category statistics', () => {
            // Arrange - create tasks in different categories
            taskController.createTask(TestDataFactory.createValidTaskData({ category: 'personal' }));
            taskController.createTask(TestDataFactory.createValidTaskData({ category: 'study' }));
            
            // Act
            const response = taskController.getCategoryStats();
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data).toHaveProperty('byCategory');
            expect(response.data).toHaveProperty('mostUsed');
            expect(response.data.byCategory.work.total).toBe(1);
            expect(response.data.byCategory.personal.total).toBe(1);
            expect(response.data.byCategory.study.total).toBe(1);
        });
        
        test('should update task category', () => {
            // Act
            const response = taskController.updateTaskCategory(testTask.id, 'personal');
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data.category).toBe('personal');
            expect(response.message).toContain('Personal');
        });
        
        test('should get available categories', () => {
            // Act
            const response = taskController.getAvailableCategories();
            
            // Assert
            TestAssertions.assertControllerResponse(response, true);
            expect(response.data).toBeInstanceOf(Array);
            expect(response.data.length).toBeGreaterThan(0);
            expect(response.data[0]).toHaveProperty('value');
            expect(response.data[0]).toHaveProperty('label');
        });
    });
});