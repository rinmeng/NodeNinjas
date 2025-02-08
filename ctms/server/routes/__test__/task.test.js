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

describe('Task Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /task/all', () => {
        it('should return all tasks when successful', async () => {
            const mockTasks = [
                {
                    id: 1,
                    name: 'Task 1',
                    assigned_users: [{ user_id: 1, username: 'user1', display_name: 'User One' }]
                }
            ];

            pool.query.mockResolvedValueOnce({ rows: mockTasks });

            const response = await request(app).get('/task/all');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTasks);
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/task/all');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to retrieve tasks' });
        });
    });

    describe('POST /task/add', () => {
        it('should create new task with minimal fields', async () => {
            const taskData = {
                name: 'New Task',
                date: '2023-12-01'
            };

            const mockTask = { id: 1, ...taskData };
            pool.query.mockResolvedValueOnce({ rows: [mockTask] }); // BEGIN
            pool.query.mockResolvedValueOnce({ rows: [mockTask] }); // INSERT
            pool.query.mockResolvedValueOnce({}); // COMMIT

            const response = await request(app)
                .post('/task/add')
                .send(taskData);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockTask);
        });

        it('should create task with assignments', async () => {
            const taskData = {
                name: 'New Task',
                date: '2023-12-01',
                assigned_users: [1, 2]
            };

            const mockTask = { id: 1, ...taskData };
            pool.query.mockResolvedValueOnce({ rows: [mockTask] }); // BEGIN
            pool.query.mockResolvedValueOnce({ rows: [mockTask] }); // INSERT
            pool.query.mockResolvedValueOnce({}); // INSERT assignments
            pool.query.mockResolvedValueOnce({}); // COMMIT

            const response = await request(app)
                .post('/task/add')
                .send(taskData);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockTask);
        });
    });

    describe('PUT /task/:id', () => {
        it('should update existing task', async () => {
            const updateData = {
                name: 'Updated Task',
                status: 'completed'
            };

            const mockUpdatedTask = { id: 1, ...updateData };
            pool.query.mockResolvedValueOnce({}); // BEGIN
            pool.query.mockResolvedValueOnce({ rows: [mockUpdatedTask] }); // UPDATE
            pool.query.mockResolvedValueOnce({}); // COMMIT

            const response = await request(app)
                .put('/task/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUpdatedTask);
        });

        it('should handle non-existent task', async () => {
            pool.query.mockResolvedValueOnce({}); // BEGIN
            pool.query.mockResolvedValueOnce({ rows: [] }); // UPDATE
            pool.query.mockResolvedValueOnce({}); // ROLLBACK

            const response = await request(app)
                .put('/task/999')
                .send({ name: 'Updated Task' });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Task not found' });
        });
    });

    describe('DELETE /task/:id', () => {
        it('should delete existing task', async () => {
            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            const response = await request(app).delete('/task/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Task deleted successfully' });
        });

        it('should handle non-existent task', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app).delete('/task/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Task not found' });
        });
    });

    describe('GET /task/:id', () => {
        it('should return specific task', async () => {
            const mockTask = {
                id: 1,
                name: 'Task 1',
                assigned_users: [{ user_id: 1, username: 'user1', display_name: 'User One' }]
            };

            pool.query.mockResolvedValueOnce({ rows: [mockTask] });

            const response = await request(app).get('/task/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTask);
        });

        it('should handle non-existent task', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app).get('/task/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Task not found' });
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/task/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to retrieve task' });
        });
    });
});