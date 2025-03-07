const { app } = require('../../server');
const request = require('supertest');
const pool = require('../../db');
const { isAuthenticated } = require('../../auth');

jest.mock('../../db');
jest.mock('../../auth');

describe('Notification Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock authentication middleware to pass through
        isAuthenticated.mockImplementation((req, res, next) => next());
    });


    describe('POST /add', () => {
        it('should add notifications successfully', async () => {
            // Mock the database query
            pool.query.mockResolvedValue({ rows: [{ id: 1, message: 'Test notification', user_id: 1 }] });

            const response = await request(app)
                .post('/notification/add')  // Updated path
                .send({ message: 'Test notification', user_ids: [1, 2] });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ message: 'Notificaion added successfully' });
            expect(pool.query).toHaveBeenCalledTimes(2);
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/notification/add')  // Updated path
                .send({ message: 'Test notification' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Please enter all required fields' });
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('should return 500 if database query fails', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/notification/add')  // Updated path
                .send({ message: 'Test notification', user_ids: [1] });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to add notification' });
        });
    });

    describe('GET /get/all/:user_id', () => {
        it('should get all notifications for a user', async () => {
            const mockNotifications = [
                { id: 1, message: 'Notification 1', user_id: 1 },
                { id: 2, message: 'Notification 2', user_id: 1 }
            ];

            pool.query.mockResolvedValue({ rows: mockNotifications });

            const response = await request(app).get('/notification/get/all/1');  // Updated path

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockNotifications);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
                [expect.any(String)]
            );
        });

        it('should return 500 if fetching notifications fails', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/notification/get/all/1');  // Updated path

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to fetch notifications' });
        });
    });
});