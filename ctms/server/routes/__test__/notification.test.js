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


describe('Notification Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const sampleNotification = {
        id: 1,
        user_id: 1,
        message: 'Test notification',
        type: 'info',
        status: 'unread',
        created_at: new Date(),
        updated_at: new Date()
    };

    describe('GET /notification/all', () => {
        test('should return all notifications for user', async () => {
            pool.query.mockResolvedValueOnce({ rows: [sampleNotification] });

            const response = await request(app)
                .get('/notification/all');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([sampleNotification]);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT *'),
                [1]
            );
        });

        test('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get('/notification/all');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to retrieve notifications' });
        });
    });

    describe('PUT /notification/read/:id', () => {
        test('should mark notification as read', async () => {
            const updatedNotification = { ...sampleNotification, status: 'read' };
            pool.query.mockResolvedValueOnce({ rows: [updatedNotification] });

            const response = await request(app)
                .put('/notification/read/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedNotification);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE notifications'),
                [1, 1]
            );
        });

        test('should return 404 when notification not found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .put('/notification/read/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Notification not found or unauthorized' });
        });

        test('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .put('/notification/read/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to mark notification as read' });
        });
    });

    describe('PUT /notification/read-all', () => {
        test('should mark all notifications as read', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .put('/notification/read-all');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'All notifications marked as read' });
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE notifications'),
                [1]
            );
        });

        test('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .put('/notification/read-all');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to mark notifications as read' });
        });
    });

    describe('DELETE /notification/:id', () => {
        test('should delete notification', async () => {
            pool.query.mockResolvedValueOnce({ rows: [sampleNotification] });

            const response = await request(app)
                .delete('/notification/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Notification deleted successfully' });
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM notifications'),
                [1, 1]
            );
        });

        test('should return 404 when notification not found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .delete('/notification/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Notification not found or unauthorized' });
        });

        test('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .delete('/notification/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to delete notification' });
        });
    });
});