const app = require('../../server');
const request = require('supertest');
const pool = require('../../db');

// Mock the database pool
jest.mock('../../db', () => ({
    query: jest.fn()
}));
// Mock authentication middleware
jest.mock('../../auth', () => ({
    isAuthenticated: (req, res, next) => next(),
    isAuthAsAdmin: (req, res, next) => next()
}));

// 

describe('Notification Routes', () => {
    // pass the test since we have no routes yet
    it('should pass since we have no routes yet', () => {
        expect(true).toBe(true);
    });

});
