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

    describe('POST /notification/add/:ids', () => {
        it('should add notifications successfully', async () => {
            // Mock the database query
            pool.query.mockResolvedValue({ rows: [{ id: 1, message: 'Test notification', user_id: 1 }] });

            const response = await request(app)
                .post('/notification/add/1')
                .send({ message: 'Test notification', user_ids: [1, 2], type: 'alert' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ message: 'Notification added successfully' });
            expect(pool.query).toHaveBeenCalledTimes(1);
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/notification/add/1')
                .send({ message: 'Test notification' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Please enter all required fields' });
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('should return 400 if user_ids is empty', async () => {
            const response = await request(app)
                .post('/notification/add/1')
                .send({ message: 'Test notification', user_ids: [], type: 'alert' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Please enter all required fields' });
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('should return 500 if database query fails', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/notification/add/1')
                .send({ message: 'Test notification', user_ids: [1], type: 'alert' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to add notification' });
        });
    });

    describe('GET /notification/get/all/:user_id', () => {
        it('should get all notifications for a user', async () => {
            const mockNotifications = [
                { id: 1, message: 'Notification 1', user_id: 1, type: 'alert', status: 'unread', created_at: '2023-01-01T00:00:00.000Z' },
                { id: 2, message: 'Notification 2', user_id: 1, type: 'message', status: 'read', created_at: '2023-01-02T00:00:00.000Z' }
            ];

            pool.query.mockResolvedValue({ rows: mockNotifications });

            const response = await request(app).get('/notification/get/all/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockNotifications);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
                ['1']
            );
        });

        it('should return empty array if no notifications exist', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const response = await request(app).get('/notification/get/all/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('should return 500 if fetching notifications fails', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/notification/get/all/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to fetch notifications' });
        });
    });

    describe('PUT /notification/read/:id', () => {
        it('should mark notification as read', async () => {
            const mockNotification = {
                id: 1,
                message: 'Test notification',
                user_id: 1,
                type: 'alert',
                status: 'read',
                created_at: '2023-01-01T00:00:00.000Z'
            };

            pool.query.mockResolvedValue({ rows: [mockNotification] });

            const response = await request(app).put('/notification/read/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockNotification);
            expect(pool.query).toHaveBeenCalledWith(
                "UPDATE notifications SET status = 'read' WHERE id = $1 RETURNING *",
                ['1']
            );
        });

        it('should return 404 if notification not found', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const response = await request(app).put('/notification/read/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Notification not found' });
        });

        it('should return 500 if updating notification fails', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).put('/notification/read/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to update notification' });
        });
    });

    describe('PUT /notification/unread/:id', () => {
        it('should mark notification as unread', async () => {
            const mockNotification = {
                id: 1,
                message: 'Test notification',
                user_id: 1,
                type: 'alert',
                status: 'unread',
                created_at: '2023-01-01T00:00:00.000Z'
            };

            pool.query.mockResolvedValue({ rows: [mockNotification] });

            const response = await request(app).put('/notification/unread/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockNotification);
            expect(pool.query).toHaveBeenCalledWith(
                "UPDATE notifications SET status = 'unread' WHERE id = $1 RETURNING *",
                ['1']
            );
        });

        it('should return 404 if notification not found', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const response = await request(app).put('/notification/unread/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Notification not found' });
        });

        it('should return 500 if updating notification fails', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).put('/notification/unread/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to update notification' });
        });
    });
});