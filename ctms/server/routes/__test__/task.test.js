const { app } = require('../../server');
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


// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});

// Mock data
const mockTasks = [
    { id: 1, name: 'Task 1', date: '2023-01-01', description: 'Description 1', status: 'pending', priority: 'high' },
    { id: 2, name: 'Task 2', date: '2023-01-02', description: 'Description 2', status: 'in_progress', priority: 'medium' }
];

describe('Task Routes', () => {
    // GET /task/all
    describe('GET /task/all', () => {
        test('should return all tasks', async () => {
            pool.query.mockResolvedValueOnce({ rows: mockTasks });

            const response = await request(app).get('/task/all');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTasks);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM task ORDER BY id ASC');
        });

        test('should return 500 on database error', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/task/all');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to fetch tasks' });
        });
    });

    // POST /task/add
    describe('POST /task/add', () => {
        const newTask = {
            name: 'New Task',
            date: '2023-01-01',
            description: 'New Description',
            status: 'pending',
            priority: 'high',
            owner_id: 1
        };

        test('should create a new task', async () => {
            // Mock checks for existing name/description
            pool.query.mockResolvedValueOnce({ rowCount: 0 }); // name check
            pool.query.mockResolvedValueOnce({ rowCount: 0 }); // description check

            // Mock transaction queries
            pool.query.mockResolvedValueOnce({}); // BEGIN
            pool.query.mockResolvedValueOnce({
                rows: [{ ...newTask, id: 3 }]
            }); // INSERT task
            pool.query.mockResolvedValueOnce({}); // INSERT assignedto
            pool.query.mockResolvedValueOnce({}); // COMMIT

            const response = await request(app)
                .post('/task/add')
                .send(newTask);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ ...newTask, id: 3 });
        });

        test('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/task/add')
                .send({ name: 'Task', date: '2023-01-01' }); // missing status and priority

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Missing required fields' });
        });

        test('should return 400 if task name already exists', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 1 }); // name exists

            const response = await request(app)
                .post('/task/add')
                .send(newTask);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Task name already exists' });
        });

        test('should return 400 if task description already exists', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 0 }); // name doesn't exist
            pool.query.mockResolvedValueOnce({ rowCount: 1 }); // description exists

            const response = await request(app)
                .post('/task/add')
                .send(newTask);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Task description already exists' });
        });

        test('should return 500 on database error', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 0 }); // name check
            pool.query.mockResolvedValueOnce({ rowCount: 0 }); // description check
            pool.query.mockResolvedValueOnce({}); // BEGIN
            pool.query.mockRejectedValueOnce(new Error('Database error')); // INSERT error
            pool.query.mockResolvedValueOnce({}); // ROLLBACK

            const response = await request(app)
                .post('/task/add')
                .send(newTask);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Failed to create task' });
        });
    });

    // DELETE /task/delete/:id
    describe('DELETE /task/delete/:id', () => {
        test('should delete a task', async () => {
            pool.query.mockResolvedValueOnce({}); // BEGIN
            pool.query.mockResolvedValueOnce({}); // DELETE assignedto
            pool.query.mockResolvedValueOnce({ rowCount: 1 }); // DELETE task
            pool.query.mockResolvedValueOnce({}); // COMMIT

            const response = await request(app)
                .delete('/task/delete/1')
                .send({ id: 1 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Task deleted successfully' });
        });

        test('should return 400 if task ID is missing', async () => {
            const response = await request(app)
                .delete('/task/delete/1')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Task ID is required' });
        });

        test('should return 404 if task not found', async () => {
            pool.query.mockResolvedValueOnce({}); // BEGIN
            pool.query.mockResolvedValueOnce({}); // DELETE assignedto
            pool.query.mockResolvedValueOnce({ rowCount: 0 }); // DELETE task
            pool.query.mockResolvedValueOnce({}); // ROLLBACK

            const response = await request(app)
                .delete('/task/delete/999')
                .send({ id: 999 });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Task not found' });
        });
    });

    // PUT /task/update/:id
    describe('PUT /task/update/:id', () => {
        const updatedTask = {
            id: 1,
            name: 'Updated Task',
            date: '2023-02-01',
            description: 'Updated Description',
            status: 'completed',
            priority: 'low'
        };

        test('should update a task', async () => {
            pool.query.mockResolvedValueOnce({}); // BEGIN
            pool.query.mockResolvedValueOnce({
                rowCount: 1,
                rows: [updatedTask]
            }); // UPDATE
            pool.query.mockResolvedValueOnce({}); // COMMIT

            const response = await request(app)
                .put('/task/update/1')
                .send(updatedTask);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedTask);
        });

        test('should return 404 if task not found', async () => {
            pool.query.mockResolvedValueOnce({}); // BEGIN
            pool.query.mockResolvedValueOnce({ rowCount: 0 }); // UPDATE
            pool.query.mockResolvedValueOnce({}); // ROLLBACK

            const response = await request(app)
                .put('/task/update/999')
                .send({ ...updatedTask, id: 999 });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Task not found' });
        });
    });

    // GET /task/id/:id
    describe('GET /task/id/:id', () => {
        test('should return a task with assigned users', async () => {
            const taskWithUsers = [
                { id: 1, name: 'Task', date: '2023-01-01', description: 'Description', status: 'pending', priority: 'high', user_id: 1, username: 'user1', display_name: 'User One' },
                { id: 1, name: 'Task', date: '2023-01-01', description: 'Description', status: 'pending', priority: 'high', user_id: 2, username: 'user2', display_name: 'User Two' }
            ];

            pool.query.mockResolvedValueOnce({ rows: taskWithUsers, rowCount: 2 });

            const response = await request(app).get('/task/id/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                name: 'Task',
                date: '2023-01-01',
                description: 'Description',
                status: 'pending',
                priority: 'high',
                assigned_users: [
                    { user_id: 1, username: 'user1', display_name: 'User One' },
                    { user_id: 2, username: 'user2', display_name: 'User Two' }
                ]
            });
        });

        test('should return 404 if task not found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const response = await request(app).get('/task/id/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Task not found' });
        });
    });

    // Additional tests for other endpoints
    describe('GET /task/assignedto/user/:id', () => {
        test('should return tasks assigned to a user', async () => {
            pool.query.mockResolvedValueOnce({
                rows: mockTasks,
                rowCount: 2
            });

            const response = await request(app).get('/task/assignedto/user/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTasks);
        });

        test('should return 404 if no tasks found', async () => {
            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const response = await request(app).get('/task/assignedto/user/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'No tasks found under this user' });
        });
    });

    describe('Task locking and unlocking', () => {
        test('should lock a task', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ id: 1, is_locked: true }],
                rowCount: 1
            });

            const response = await request(app)
                .put('/task/lock/1')
                .send({ id: 1 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: 1, is_locked: true });
        });

        test('should unlock a task', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ id: 1, is_locked: false }],
                rowCount: 1
            });

            const response = await request(app)
                .put('/task/unlock/1')
                .send({ id: 1 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: 1, is_locked: false });
        });
    });

    describe('Task assignment', () => {
        test('should assign users to a task', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] }); // No users already assigned
            pool.query.mockResolvedValueOnce({}); // Insert successful

            const response = await request(app)
                .post('/task/assign/1')
                .send({ user_ids: [1, 2] });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ message: 'Assignment process completed' });
        });

        test('should unassign users from a task', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ user_id: 1 }, { user_id: 2 }],
                rowCount: 2
            });

            const response = await request(app)
                .delete('/task/unassign/1')
                .send({ user_ids: [1, 2] });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Unassignment process completed' });
        });
    });
});
