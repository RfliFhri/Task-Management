/**
 * Test Assertions - Helper untuk assertions yang sering dipakai
 * 
 * Custom assertions untuk mempermudah testing dan membuat test lebih readable
 */
export default class TestAssertions {
    /**
     * Assert bahwa task memiliki properties yang diperlukan
     */
    static assertTaskHasRequiredProperties(task) {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('ownerId');
        expect(task).toHaveProperty('createdAt');
        expect(task).toHaveProperty('status');
        expect(task).toHaveProperty('priority');
        expect(task).toHaveProperty('category');
    }
    
    /**
     * Assert bahwa user memiliki properties yang diperlukan
     */
    static assertUserHasRequiredProperties(user) {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('isActive');
        expect(user).toHaveProperty('createdAt');
    }
    
    /**
     * Assert response format dari controller
     * 
     * PENTING: Controller response bisa memiliki format berbeda:
     * - Create/Read/Update: {success: true, data: ...}
     * - Delete: {success: true, message: ...}
     * - Error: {success: false, error: ...}
     */
    static assertControllerResponse(response, shouldSucceed = true) {
        expect(response).toHaveProperty('success');
        expect(response.success).toBe(shouldSucceed);
        
        if (shouldSucceed) {
            // Success response bisa punya 'data' atau 'message'
            const hasData = Object.hasOwn(response, 'data');
            const hasMessage = Object.hasOwn(response, 'message');
            expect(hasData || hasMessage).toBe(true);
        } else {
            expect(response).toHaveProperty('error');
            expect(typeof response.error).toBe('string');
        }
    }
    
    /**
     * Assert bahwa error message sesuai ekspektasi
     */
    static assertErrorMessage(error, expectedMessage) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain(expectedMessage);
    }
    
    /**
     * Assert validation result
     */
    static assertValidationResult(result, shouldBeValid, expectedErrors = []) {
        expect(result.isValid).toBe(shouldBeValid);
        if (!shouldBeValid) {
            expectedErrors.forEach(error => {
                expect(result.errors).toContain(error);
            });
        }
    }
}
