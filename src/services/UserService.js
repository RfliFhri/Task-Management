import User from '../models/User.js';

export default class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.listeners = new Set();
    }
    
    addListener(listener) {
        this.listeners.add(listener);
    }
    
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    
    notifyListeners(eventType, data) {
        this.listeners.forEach(listener => {
            try {
                listener(eventType, data);
            } catch (error) {
                console.error('Error in user service listener:', error);
            }
        });
    }
    
    async createUser(userData) {
        try {
            const user = new User(userData.username, userData.email, userData);
            const savedUser = await this.userRepository.create(user);
            
            this.notifyListeners('userCreated', savedUser);
            return savedUser;
        } catch (error) {
            this.notifyListeners('error', { operation: 'createUser', error: error.message });
            throw error;
        }
    }
    
    async getUserById(userId) {
        return await this.userRepository.findById(userId);
    }
    
    async updateUser(userId, updates) {
        try {
            const updatedUser = await this.userRepository.update(userId, updates);
            if (updatedUser) {
                this.notifyListeners('userUpdated', updatedUser);
            }
            return updatedUser;
        } catch (error) {
            this.notifyListeners('error', { operation: 'updateUser', error: error.message });
            throw error;
        }
    }
    
    async getAllUsers() {
        return await this.userRepository.findAll();
    }
    
    async authenticateUser(usernameOrEmail, password) {
        return await this.userRepository.authenticate(usernameOrEmail, password);
    }
    
    async logoutUser(userId) {
        const user = await this.userRepository.findById(userId);
        if (user) {
            user.logout();
            await this.userRepository.update(userId, user.toJSON());
        }
    }
}