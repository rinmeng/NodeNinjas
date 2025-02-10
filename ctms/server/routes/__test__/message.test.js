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


describe('Message Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /message/all', () => {
        it('should return all messages for authenticated user', async () => {
            const mockMessages = [
                {
                    id: 1,
                    message: 'Test message',
                    sender: {
                        id: 1,
                        username: 'testuser',
                        display_name: 'Test User'
                    },
                    task: {
                        id: 1,
                        name: 'Test Task'
                    }
                }
            ];

            pool.query.mockResolvedValueOnce({ rows: mockMessages });

            const response = await request(app)
                .get('/message/all')
                .expect(200);

            expect(response.body).toEqual(mockMessages);
        });
    });

    describe('POST /message/send', () => {
        it('should create a new message', async () => {
            const mockMessage = {
                id: 1,
                message: 'New message',
                user_id: 1,
                task_id: null,
                sent_at: new Date().toISOString()
            };

            pool.query.mockResolvedValueOnce({ rows: [mockMessage] });

            const response = await request(app)
                .post('/message/send')
                .send({ message: 'New message' })
                .expect(201);

            expect(response.body).toEqual(mockMessage);
        });
    });

    describe('GET /message/task/:taskId', () => {
        it('should return messages for specific task', async () => {
            const mockTaskMessages = [
                {
                    id: 1,
                    message: 'Task message',
                    sender: {
                        id: 1,
                        username: 'testuser',
                        display_name: 'Test User'
                    }
                }
            ];

            pool.query.mockResolvedValueOnce({ rows: mockTaskMessages });

            const response = await request(app)
                .get('/message/task/1')
                .expect(200);

            expect(response.body).toEqual(mockTaskMessages);
        });
    });

    describe('DELETE /message/:id', () => {
        it('should delete message if owner', async () => {
            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            const response = await request(app)
                .delete('/message/1')
                .expect(200);

            expect(response.body).toEqual({ message: 'Message deleted successfully' });
        });

        it('should return 404 if message not found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .delete('/message/999')
                .expect(404);

            expect(response.body).toEqual({ message: 'Message not found or unauthorized' });
        });
    });
});
