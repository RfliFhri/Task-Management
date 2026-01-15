export default {
    // Environment untuk testing (browser-like)
    testEnvironment: 'jsdom',
    
    // Pattern file test yang akan dijalankan
    testMatch: [
        '**/tests/**/*.test.js',
        '**/day3-testing/**/*.test.js'
    ],
    
    // Setup coverage (laporan seberapa banyak kode yang di-test)
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'html'],
    
    // File mana saja yang akan di-cover
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!**/node_modules/**'
    ],
    
    // Target coverage minimum
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    
    // Output yang detail untuk pembelajaran
    verbose: true,
    
    // Clear mocks antar test
    clearMocks: true
};