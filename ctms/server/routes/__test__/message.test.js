const request = require('supertest');
const express = require('express');
const pool = require('../../db');
const messageRouter = require('../message');

// Create a new Express app instance for testing
const app = express();
app.use(express.json());

// Mock Socket.io
const mockIo = {
    to: jest.fn().mockReturnValue({
        emit: jest.fn()
    })
};

// Set up the io instance for the app
app.set('io', mockIo);

app.use('/message', messageRouter);

// Mock the database pool
jest.mock('../../db', () => ({
    query: jest.fn()
}));

// Mock authentication middleware
jest.mock('../../auth', () => ({
    isAuthenticated: (req, res, next) => next(),
    isAuthAsAdmin: (req, res, next) => next()
}));

describe('Messages Routes', () => {
    describe('POST /message', () => {
        it('should create a new message when all fields are provided', async () => {
            const mockDate = new Date();
            const mockMessage = {
                id: 1,
                sender_id: 1,
                recipient_id: 2,
                text: 'Hello',
                sent_at: mockDate
            };

            // The response will contain the date as a string
            const expectedResponse = {
                id: 1,
                sender_id: 1,
                recipient_id: 2,
                text: 'Hello',
                sent_at: mockDate.toISOString()
            };

            pool.query.mockResolvedValueOnce({ rows: [mockMessage] });

            const response = await request(app)
                .post('/message')
                .send({
                    sender_id: 1,
                    recipient_id: 2,
                    text: 'Hello'
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(expectedResponse);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO messages'),
                [1, 2, 'Hello']
            );
        });

        it('should return 400 if any field is missing', async () => {
            const response = await request(app)
                .post('/message')
                .send({
                    sender_id: 1,
                    recipient_id: 2,
                    text: ''
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'All fields are required.' });
        });

        it('should return 500 if there is a database error', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/message')
                .send({
                    sender_id: 1,
                    recipient_id: 2,
                    text: 'Hello'
                });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Failed to send message.' });
        });
    });
});
