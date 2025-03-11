const request = require('supertest');
const express = require('express');
const pool = require('../../db');
const messageRouter = require('../message');

// Create a new Express app instance for testing
const app = express();
app.use(express.json());
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
    // Test sending a message
    describe('POST /message', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should create a new message when all fields are provided', async () => {
            const mockMessage = {
                id: 1,
                sender_id: 1,
                recipient_id: 2,
                text: 'Hello there',
                sent_at: new Date().toISOString()
            };

            pool.query.mockResolvedValueOnce({ rows: [mockMessage] });

            const response = await request(app)
                .post('/message')
                .send({
                    sender_id: 1,
                    recipient_id: 2,
                    text: 'Hello there'
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockMessage);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO messages'),
                [1, 2, 'Hello there']
            );
        });

        it('should return 400 when fields are missing', async () => {
            const response = await request(app)
                .post('/message')
                .send({
                    sender_id: 1,
                    text: 'Hello there'
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'All fields are required.' });
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('should return 400 when text is empty', async () => {
            const response = await request(app)
                .post('/message')
                .send({
                    sender_id: 1,
                    recipient_id: 2,
                    text: '   '
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'All fields are required.' });
        });

        it('should return 500 when database query fails', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/message')
                .send({
                    sender_id: 1,
                    recipient_id: 2,
                    text: 'Hello there'
                });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Failed to send message.' });
        });
    });

    // Test getting messages between users
    describe('GET /message/:sender_id/:recipient_id', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return messages between two users', async () => {
            const mockMessages = [
                {
                    id: 1,
                    sender_id: 1,
                    recipient_id: 2,
                    text: 'Hello there',
                    sent_at: new Date().toISOString()
                },
                {
                    id: 2,
                    sender_id: 2,
                    recipient_id: 1,
                    text: 'Hi back',
                    sent_at: new Date().toISOString()
                }
            ];

            pool.query.mockResolvedValueOnce({ rows: mockMessages });

            const response = await request(app).get('/message/1/2');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockMessages);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM messages'),
                ['1', '2']
            );
        });

        it('should return 500 when database query fails', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/message/1/2');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Failed to retrieve messages.' });
        });
    });

});

