const express = require('express');
const request = require('supertest');
const pool = require('../../db');
const { isAuthenticated } = require('../../auth');

// Mock the database pool
jest.mock('../../db', () => ({
    query: jest.fn()
}));

// Mock authentication middleware
jest.mock('../../auth', () => ({
    isAuthenticated: (req, res, next) => next()
}));

// Import the router
const notificationRouter = require('../../routes/notification');

// Create an Express app and use the router
const app = express();
app.use(express.json());
app.use('/notification', notificationRouter);

describe('Notification Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear all mocks before each test
    });

    describe('POST /notification/add', () => {
        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/notification/add')
                .send({}); // Send empty body

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Please enter all required fields');
        });

        it('should return 201 and success message if notification is added successfully', async () => {
            const mockRequestBody = {
                message: 'Test notification',
                user_ids: [1, 2, 3]
            };

            // Mock the database query to resolve successfully
            pool.query.mockResolvedValue({ rows: [{ id: 1, message: 'Test notification', user_id: 1 }] });

            const response = await request(app)
                .post('/notification/add')
                .send(mockRequestBody);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Notificaion added successfully');
            expect(pool.query).toHaveBeenCalledTimes(mockRequestBody.user_ids.length); 
        });

        it('should return 500 if database query fails', async () => {
            const mockRequestBody = {
                message: 'Test notification',
                user_ids: [1, 2, 3]
            };

            // Mock the database query to reject with an error
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/notification/add')
                .send(mockRequestBody);

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Failed to add notification');
        });
    });

    describe('GET /notification/get/all/:user_id', () => {
    
        it('should return 500 if database query fails', async () => {
            const mockUserId = 1;
    
            // Mock the database query to reject with an error
            pool.query.mockRejectedValue(new Error('Database error'));
    
            const response = await request(app)
                .get(`/notification/get/all/${mockUserId}`)
                .send();
    
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Failed to fetch notifications');
        });
    });
});