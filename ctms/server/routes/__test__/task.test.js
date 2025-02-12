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

    describe('GET /', () => {
        it('should return documentation HTML', async () => {
            const response = await request(app).get('/task/');
            expect(response.status).toBe(200);
            expect(response.text).toContain('Task Endpoint Documentation');
            expect(response.text).toContain('<!DOCTYPE html>');
        });
    });

    describe('POST /task/add', () => {
        it('should create a new task successfully', async () => {
            const mockTask = {
                id: 1,
                name: 'Test Task',
                date: '2024-01-01',
                description: 'Test Description',
                status: 'pending',
                priority: 'medium'
            };

            // Mock successful transaction
            pool.query
                .mockResolvedValueOnce() // BEGIN
                .mockResolvedValueOnce({ rows: [mockTask] }) // INSERT
                .mockResolvedValueOnce() // INSERT into assignedto
                .mockResolvedValueOnce(); // COMMIT

            const response = await request(app)
                .post('/task/add')
                .send({
                    name: 'Test Task',
                    date: '2024-01-01',
                    description: 'Test Description',
                    status: 'pending',
                    priority: 'medium',
                    assigned_users: [1, 2]
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockTask);
            expect(pool.query).toHaveBeenCalledTimes(4);
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/task/add')
                .send({
                    name: 'Test Task'
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                message: 'Missing required fields'
            });
        });

        it('should handle database errors', async () => {
            // Mock BEGIN to succeed but INSERT to fail
            pool.query
                .mockResolvedValueOnce() // BEGIN succeeds
                .mockRejectedValueOnce(new Error('Database error')); // INSERT fails

            const response = await request(app)
                .post('/task/add')
                .send({
                    name: 'Test Task',
                    date: '2024-01-01',
                    status: 'pending',
                    priority: 'medium'
                });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: 'Failed to create task'
            });

            // Verify ROLLBACK was called
            expect(pool.query).toHaveBeenCalledWith('ROLLBACK');
        }, 10000); // Increased timeout to 10 seconds
    });

    describe('DELETE /task/delete/:id', () => {
        it('should delete a task successfully', async () => {
            pool.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [{ id: 1 }]
            });

            const response = await request(app)
                .delete('/task/delete/1')
                .send({ id: 1 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: 'Task deleted successfully'
            });
            expect(pool.query).toHaveBeenCalledWith(
                'DELETE FROM task WHERE id = $1 RETURNING *',
                [1]
            );
        });

        it('should return 400 if task ID is missing', async () => {
            const response = await request(app)
                .delete('/task/delete/1')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                message: 'Task ID is required'
            });
        });

        it('should return 404 if task is not found', async () => {
            pool.query.mockResolvedValueOnce({
                rowCount: 0,
                rows: []
            });

            const response = await request(app)
                .delete('/task/delete/999')
                .send({ id: 999 });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                message: 'Task not found'
            });
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .delete('/task/delete/1')
                .send({ id: 1 });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: 'Failed to delete task'
            });
        });
    });

    describe('PUT /task/update/:id', () => {
        it('should update a task successfully', async () => {
            const mockTask = {
                id: 1,
                name: 'Updated Task',
                date: '2024-01-01',
                description: 'Updated Description',
                status: 'in_progress',
                priority: 'high'
            };

            pool.query
                .mockResolvedValueOnce() // BEGIN
                .mockResolvedValueOnce({ rows: [mockTask], rowCount: 1 }) // UPDATE
                .mockResolvedValueOnce() // DELETE assignments
                .mockResolvedValueOnce() // INSERT new assignments
                .mockResolvedValueOnce(); // COMMIT

            const response = await request(app)
                .put('/task/update/1')
                .send({
                    id: 1,
                    name: 'Updated Task',
                    date: '2024-01-01',
                    description: 'Updated Description',
                    status: 'in_progress',
                    priority: 'high',
                    assigned_users: [1, 2]
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTask);
            expect(pool.query).toHaveBeenCalledTimes(5);
        });

        it('should return 404 if task not found', async () => {
            pool.query
                .mockResolvedValueOnce() // BEGIN
                .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE returns nothing

            const response = await request(app)
                .put('/task/update/999')
                .send({
                    id: 999,
                    name: 'Updated Task'
                });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                message: 'Task not found'
            });
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .put('/task/update/1')
                .send({
                    id: 1,
                    name: 'Updated Task'
                });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: 'Failed to update task'
            });
        });
    });

    describe('GET /task/id/:id', () => {
        it('should fetch a task successfully', async () => {
            const mockTaskRow = {
                id: 1,
                name: 'Test Task',
                date: '2024-01-01',
                description: 'Test Description',
                status: 'pending',
                priority: 'medium',
                user_id: 1,
                username: 'testuser',
                display_name: 'Test User'
            };

            pool.query.mockResolvedValueOnce({
                rows: [mockTaskRow],
                rowCount: 1
            });

            const response = await request(app)
                .get('/task/id/1')
                .send({ id: 1 });

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: 1,
                name: 'Test Task',
                assigned_users: [{
                    user_id: 1,
                    username: 'testuser',
                    display_name: 'Test User'
                }]
            });
        });

        it('should return 400 if task ID is missing', async () => {
            const response = await request(app)
                .get('/task/id/1')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                message: 'Task ID is required'
            });
        });

        it('should return 404 if task not found', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            });

            const response = await request(app)
                .get('/task/id/999')
                .send({ id: 999 });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                message: 'Task not found'
            });
        });
    });

    describe('GET /task/assignedto/:id', () => {
        it('should fetch assigned tasks successfully', async () => {
            const mockTasks = [{
                id: 1,
                name: 'Task 1',
                date: '2024-01-01',
                description: 'Description 1',
                status: 'pending',
                priority: 'medium'
            }];

            pool.query.mockResolvedValueOnce({
                rows: mockTasks
            });

            const response = await request(app)
                .get('/task/assignedto/1')
                .send({ id: 1 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTasks);
        });

        it('should return 400 if user ID is missing', async () => {
            const response = await request(app)
                .get('/task/assignedto/1')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                message: 'User ID is required'
            });
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get('/task/assignedto/1')
                .send({ id: 1 });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: 'Failed to fetch tasks'
            });
        });
    });

    describe('GET /task/all/userid/:id', () => {
        it('should fetch all tasks for a user successfully', async () => {
            const mockTasks = [{
                id: 1,
                name: 'Task 1',
                date: '2024-01-01',
                description: 'Description 1',
                status: 'pending',
                priority: 'medium'
            }];

            pool.query.mockResolvedValueOnce({
                rows: mockTasks,
                rowCount: 1
            });

            const response = await request(app)
                .get('/task/all/userid/1')
                .send({ id: 1 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTasks);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT t.id, t.name, t.date'),
                [1]
            );
        });

        it('should return 400 if user ID is missing', async () => {
            const response = await request(app)
                .get('/task/all/userid/1')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                message: 'User ID is required'
            });
        });

        it('should return 404 if no tasks found for user', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            });

            const response = await request(app)
                .get('/task/all/userid/1')
                .send({ id: 1 });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                message: 'No tasks found under this user'
            });
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get('/task/all/userid/1')
                .send({ id: 1 });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: 'Failed to fetch tasks'
            });
        });
    });
});