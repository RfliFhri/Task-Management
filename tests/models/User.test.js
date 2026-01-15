// Import dependencies
import TestDataFactory from '../helpers/TestDataFactory';
import TestAssertions from '../helpers/TestAssertions';

// Import class yang akan di-test
import User from '../../src/models/User';

describe('User Model', () => {
    describe('User Creation', () => {
        test('should create user with valid data', () => {
            // Arrange (Persiapan)
            const userData = TestDataFactory.createValidUserData();
            
            // Act (Aksi yang di-test)
            const user = new User(userData.username, userData.email, userData.fullName);
            
            // Assert (Verifikasi hasil)
            expect(user.username).toBe(userData.username);
            expect(user.email).toBe(userData.email);
            expect(user.fullName).toBe(userData.fullName);
            expect(user.isActive).toBe(true);
            TestAssertions.assertUserHasRequiredProperties(user);
        });
        
        test('should throw error when username is empty', () => {
            // Arrange
            const userData = TestDataFactory.createValidUserData({ username: '' });
            
            // Act & Assert
            expect(() => {
                new User(userData.username, userData.email, userData.fullName);
            }).toThrow('Username wajib diisi');
        });
        
        test('should throw error when email is invalid', () => {
            // Arrange
            const userData = TestDataFactory.createValidUserData({ email: 'invalid-email' });
            
            // Act & Assert
            expect(() => {
                new User(userData.username, userData.email, userData.fullName);
            }).toThrow('Email tidak valid');
        });
        
        test('should generate unique ID for each user', () => {
            // Arrange
            const userData1 = TestDataFactory.createValidUserData({ username: 'user1' });
            const userData2 = TestDataFactory.createValidUserData({ username: 'user2' });
            
            // Act
            const user1 = new User(userData1.username, userData1.email, userData1.fullName);
            const user2 = new User(userData2.username, userData2.email, userData2.fullName);
            
            // Assert
            expect(user1.id).toBeDefined();
            expect(user2.id).toBeDefined();
            expect(user1.id).not.toBe(user2.id);
        });
    });
    
    describe('User Methods', () => {
        let user;
        
        beforeEach(() => {
            // Setup yang dijalankan sebelum setiap test
            const userData = TestDataFactory.createValidUserData();
            user = new User(userData.username, userData.email, userData.fullName);
        });
        
        test('should update profile successfully', () => {
            // Arrange
            const newFullName = 'Updated Name';
            const newEmail = 'updated@example.com';
            
            // Act
            user.updateProfile(newFullName, newEmail);
            
            // Assert
            expect(user.fullName).toBe(newFullName);
            expect(user.email).toBe(newEmail);
        });
        
        test('should record login time', () => {
            // Arrange
            const beforeLogin = new Date();
            
            // Act
            user.recordLogin();
            
            // Assert
            expect(user.lastLoginAt).toBeDefined();
            expect(user.lastLoginAt).toBeInstanceOf(Date);
            expect(user.lastLoginAt.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
        });
        
        test('should deactivate user', () => {
            // Act
            user.deactivate();
            
            // Assert
            expect(user.isActive).toBe(false);
        });
        
        test('should activate user', () => {
            // Arrange
            user.deactivate(); // First deactivate
            
            // Act
            user.activate();
            
            // Assert
            expect(user.isActive).toBe(true);
        });
    });
    
    describe('User Serialization', () => {
        test('should convert to JSON correctly', () => {
            // Arrange
            const userData = TestDataFactory.createValidUserData();
            const user = new User(userData.username, userData.email, userData.fullName);
            
            // Act
            const json = user.toJSON();
            
            // Assert
            expect(json).toHaveProperty('id', user.id);
            expect(json).toHaveProperty('username', user.username);
            expect(json).toHaveProperty('email', user.email);
            expect(json).toHaveProperty('fullName', user.fullName);
            expect(json).toHaveProperty('isActive', user.isActive);
            expect(json).toHaveProperty('createdAt');
        });
        
        test('should create user from JSON correctly', () => {
            // Arrange
            const originalUser = new User('testuser', 'test@example.com', 'Test User');
            const json = originalUser.toJSON();
            
            // Act
            const restoredUser = User.fromJSON(json);
            
            // Assert
            expect(restoredUser.id).toBe(originalUser.id);
            expect(restoredUser.username).toBe(originalUser.username);
            expect(restoredUser.email).toBe(originalUser.email);
            expect(restoredUser.fullName).toBe(originalUser.fullName);
            expect(restoredUser.isActive).toBe(originalUser.isActive);
        });
    });
});