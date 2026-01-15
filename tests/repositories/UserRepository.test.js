import TestDataFactory from '../helpers/TestDataFactory';
import TestAssertions from '../helpers/TestAssertions';
import UserRepository from '../../src/repositories/UserRepository';
import User from '../../src/models/User';

describe('UserRepository', () => {
    let userRepository;
    let mockStorage;
    
    beforeEach(() => {
        // Setup mock storage dan repository untuk setiap test
        mockStorage = TestDataFactory.createMockStorage();
        userRepository = new UserRepository(mockStorage);
    });
    
    describe('User Creation', () => {
        test('should create user successfully', () => {
            // Arrange
            const userData = TestDataFactory.createValidUserData();
            
            // Act
            const user = userRepository.create(userData);
            
            // Assert
            expect(user).toBeInstanceOf(User);
            expect(user.username).toBe(userData.username);
            expect(user.email).toBe(userData.email);
            TestAssertions.assertUserHasRequiredProperties(user);
            
            // Verify storage was called
            expect(mockStorage.save).toHaveBeenCalledWith('users', expect.any(Array));
        });
        
        test('should throw error for duplicate username', () => {
            // Arrange
            const userData = TestDataFactory.createValidUserData();
            userRepository.create(userData);
            
            // Act & Assert
            expect(() => {
                userRepository.create(userData); // Same username
            }).toThrow('Username \'testuser\' sudah digunakan');
        });
        
        test('should throw error for duplicate email', () => {
            // Arrange
            const userData1 = TestDataFactory.createValidUserData();
            const userData2 = TestDataFactory.createValidUserData({ 
                username: 'different',
                email: userData1.email // Same email
            });
            
            userRepository.create(userData1);
            
            // Act & Assert
            expect(() => {
                userRepository.create(userData2);
            }).toThrow('Email \'test@example.com\' sudah digunakan');
        });
    });
    
    describe('User Retrieval', () => {
        let testUser;
        
        beforeEach(() => {
            const userData = TestDataFactory.createValidUserData();
            testUser = userRepository.create(userData);
        });
        
        test('should find user by ID', () => {
            // Act
            const foundUser = userRepository.findById(testUser.id);
            
            // Assert
            expect(foundUser).toBeDefined();
            expect(foundUser.id).toBe(testUser.id);
            expect(foundUser.username).toBe(testUser.username);
        });
        
        test('should return null for non-existent ID', () => {
            // Act
            const foundUser = userRepository.findById('non-existent-id');
            
            // Assert
            expect(foundUser).toBeNull();
        });
        
        test('should find user by username', () => {
            // Act
            const foundUser = userRepository.findByUsername(testUser.username);
            
            // Assert
            expect(foundUser).toBeDefined();
            expect(foundUser.username).toBe(testUser.username);
        });
        
        test('should find user by email', () => {
            // Act
            const foundUser = userRepository.findByEmail(testUser.email);
            
            // Assert
            expect(foundUser).toBeDefined();
            expect(foundUser.email).toBe(testUser.email);
        });
        
        test('should return all users', () => {
            // Arrange - create additional users
            const userData2 = TestDataFactory.createValidUserData({
                username: 'user2',
                email: 'user2@example.com'
            });
            userRepository.create(userData2);
            
            // Act
            const allUsers = userRepository.findAll();
            
            // Assert
            expect(allUsers).toHaveLength(2);
            expect(allUsers.every(user => user instanceof User)).toBe(true);
        });
        
        test('should return only active users', () => {
            // Arrange - deactivate one user
            testUser.deactivate();
            userRepository.update(testUser.id, { isActive: false });
            
            const userData2 = TestDataFactory.createValidUserData({
                username: 'user2',
                email: 'user2@example.com'
            });
            userRepository.create(userData2);
            
            // Act
            const activeUsers = userRepository.findActive();
            
            // Assert
            expect(activeUsers).toHaveLength(1);
            expect(activeUsers[0].isActive).toBe(true);
        });
    });
    
    describe('User Updates', () => {
        let testUser;
        
        beforeEach(() => {
            const userData = TestDataFactory.createValidUserData();
            testUser = userRepository.create(userData);
        });
        
        test('should update user profile', () => {
            // Arrange
            const updates = {
                fullName: 'Updated Name',
                email: 'updated@example.com'
            };
            
            // Act
            const updatedUser = userRepository.update(testUser.id, updates);
            
            // Assert
            expect(updatedUser).toBeDefined();
            expect(updatedUser.fullName).toBe(updates.fullName);
            expect(updatedUser.email).toBe(updates.email);
            
            // Verify storage was called
            expect(mockStorage.save).toHaveBeenCalled();
        });
        
        test('should record login', () => {
            // Arrange
            const beforeLogin = new Date();
            
            // Act
            const updatedUser = userRepository.recordLogin(testUser.id);
            
            // Assert
            expect(updatedUser).toBeDefined();
            expect(updatedUser.lastLoginAt).toBeDefined();
            expect(updatedUser.lastLoginAt.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
        });
        
        test('should return null when updating non-existent user', () => {
            // Act
            const result = userRepository.update('non-existent-id', { fullName: 'Test' });
            
            // Assert
            expect(result).toBeNull();
        });
    });
    
    describe('User Search', () => {
        beforeEach(() => {
            // Create multiple users for search testing
            const users = [
                { username: 'john_doe', email: 'john@example.com', fullName: 'John Doe' },
                { username: 'jane_smith', email: 'jane@example.com', fullName: 'Jane Smith' },
                { username: 'bob_wilson', email: 'bob@example.com', fullName: 'Bob Wilson' }
            ];
            
            users.forEach(userData => userRepository.create(userData));
        });
        
        test('should search users by username', () => {
            // Act
            const results = userRepository.search('john');
            
            // Assert
            expect(results).toHaveLength(1);
            expect(results[0].username).toBe('john_doe');
        });
        
        test('should search users by email', () => {
            // Act
            const results = userRepository.search('jane@');
            
            // Assert
            expect(results).toHaveLength(1);
            expect(results[0].email).toBe('jane@example.com');
        });
        
        test('should search users by full name', () => {
            // Act
            const results = userRepository.search('wilson');
            
            // Assert
            expect(results).toHaveLength(1);
            expect(results[0].fullName).toBe('Bob Wilson');
        });
        
        test('should return empty array for no matches', () => {
            // Act
            const results = userRepository.search('nonexistent');
            
            // Assert
            expect(results).toHaveLength(0);
        });
    });
});