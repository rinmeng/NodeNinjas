const { app } = require('../../server');
const request = require('supertest');
const pool = require('../../db');

// Mock the database pool
jest.mock('../../db', () => ({
    query: jest.fn()
}));

// Mock the authentication middleware
jest.mock('../../auth', () => ({
    isAuthAsAdmin: (req, res, next) => next(),
    isAuthenticated: (req, res, next) => next()
}));

// Mock the password hashing function
jest.mock('../../utils/passwordUtils', () => ({
    hashPassword: jest.fn().mockResolvedValue('hashed_password'),
    comparePassword: jest.fn().mockResolvedValue(true)
}));

describe('User Routes', () => {
    // Add server variable to store server instance
    let server;

    // Start server before all tests
    beforeAll(() => {
        server = app.listen();
    });

    // Close server after all tests
    afterAll((done) => {
        if (server) {
            server.close(done);
        } else {
            done();
        }
    });

    // Clear mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Mock session middleware
    beforeEach(() => {
        // This simulates the session middleware for tests
        app.use((req, res, next) => {
            req.session = {
                destroy: callback => callback && callback(),
                user: null
            };
            next();
        });
    });

    // used to mock the user object
    const sampleUser = {
        id: 1,
        username: 'testuser',
        email: 'testemail',
        password_hash: 'testpassword',
        role: 'testrole',
        display_name: 'testdisplayname',
        manager_id: '1'
    };


    describe('GET /user/userid/:id', () => {
        it('returns user when valid ID is provided', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [sampleUser],
                rowCount: 1
            });

            const response = await request(app)
                .get('/user/userid/1');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(sampleUser);
        });

        it('returns 404 when user is not found', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            });

            const response = await request(app)
                .get('/user/userid/999');

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });

        it('returns 500 on database error', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get('/user/userid/1');

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Error searching up user id.' });
        });
    });

    describe('GET /user/username/:username', () => {
        it('returns user when valid username is provided', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [sampleUser],
                rowCount: 1
            });

            const response = await request(app)
                .get('/user/username/testuser');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(sampleUser);
        });

        it('returns 404 when username is not found', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            });

            const response = await request(app)
                .get('/user/username/nonexistent');

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });

        it('returns 500 on database error', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get('/user/username/testuser');

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Error searching up username.' });
        });
    });

    describe('DELETE /user/delete/:id', () => {
        it('successfully deletes existing user', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [sampleUser],
                rowCount: 1
            });

            const response = await request(app)
                .delete('/user/delete/1');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: 'User deleted successfully' });
        });

        it('returns 404 when trying to delete non-existent user', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            });

            const response = await request(app)
                .delete('/user/delete/999');

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ error: 'User not found' });
        });

        it('returns 500 on database error during deletion', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .delete('/user/delete/1');

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ error: 'An error occurred while deleting the user' });
        });
    });

    describe('GET /user/all', () => {
        it('returns all users when authorized as admin', async () => {
            const users = [sampleUser, { ...sampleUser, id: 2, username: 'testuser2' }];
            pool.query.mockResolvedValueOnce({
                rows: users
            });

            // Note: You'll need to mock the isAuthAsAdmin middleware or the request will fail
            const response = await request(app)
                .get('/user/all');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(users);
        });

        it('returns 500 on database error', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get('/user/all');

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Internal Server Error: Is database loaded yet?' });
        });
    });

    describe('PUT /user/update/:id', () => {
        const validUpdateUser = {
            id: 1,
            username: 'updateduser',
            email: 'updatedemail',
            password_hash: 'updatedpassword',
            role: 'updatedrole',
            display_name: 'updateddisplayname',
            manager_id: '2'
        };

        it('returns status code 200 if user role was updated successfully', async () => {
            const updatedUser = {
                id: 1,
                username: 'testuser',
                email: 'testemail',
                password_hash: 'testpassword',
                role: 'updatedrole',
                display_name: 'testdisplayname',
                manager_id: '1'
            };

            // Mock both queries: first the SELECT query, then the UPDATE query
            pool.query
                .mockResolvedValueOnce({
                    rows: [updatedUser],
                    rowCount: 1
                })
                .mockResolvedValueOnce({
                    rows: [updatedUser]
                });

            const response = await request(app)
                .put('/user/updateRole/1')
                .send({ role: 'updatedrole' });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(updatedUser);
        });

        it('returns status code 404 if user is not found', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            });

            const response = await request(app)
                .put('/user/update/999')
                .send(validUpdateUser);

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });

        it('returns status code 400 if required fields are missing', async () => {
            const invalidUser = {
                id: 1,
                username: 'updateduser'
                // Missing required fields
            };

            const response = await request(app)
                .put('/user/update/1')
                .send(invalidUser);

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({
                message: 'Required fields: username, email, password_hash, role, display_name'
            });
        });

        it('returns status code 400 if user ID is missing', async () => {
            const userWithoutId = {
                username: 'updateduser',
                email: 'updatedemail',
                password_hash: 'updatedpassword',
                role: 'updatedrole',
                display_name: 'updateddisplayname',
                manager_id: '2'
            };

            const response = await request(app)
                .put('/user/update/1')
                .send(userWithoutId);

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: 'User ID is required' });
        });

        it('returns status code 500 if database error occurs', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .put('/user/update/1')
                .send(validUpdateUser);

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating user.' });
        });
    });

    // Login and Logout routes and sessions needs to have tests written to check if Cookies are created.
    // Currently both works out fine if we check manually but Rin does not know how to write tests for them since Cookies
    // are involved, I think the issue may be that the session cannot mock cookies. Some ideas are checking the DB to see if user_sessions has a 
    // cookie under my the username/id of the user that logged in, but that would make the  API testing invalid 
    // because we need to test the route itself, not the DB. I will try to write the tests for them and see if they work.

    describe('POST /user/login', () => {
        const validLogin = {
            username: 'testuser',
            password_hash: 'testpassword'
        };

        it('returns status code 200 if login is successful', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [sampleUser],
                rowCount: 1
            });

            const response = await request(app)
                .post('/user/login')
                .send(validLogin);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toEqual("Login successful");
        });

        it('returns status code 500 if database error occurs', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/user/login')
                .send(validLogin);

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Error logging in user' });
        });

        it('returns status code 400 if required fields are missing', async () => {
            const invalidLogin = {
                username: 'testuser'
                // Missing password
            };

            const response = await request(app)
                .post('/user/login')
                .send(invalidLogin);

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: 'Username and password required' });
        });
    });

    describe('POST /user/logout', () => {
        it('returns status code 400 if no user to log out', async () => {
            const response = await request(app)
                .post('/user/logout');

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toEqual("No user to log out");
        });
    });

    describe('GET /user/session', () => {
        it('returns status code 404 if session is not active', async () => {
            const response = await request(app)
                .get('/user/session');

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'No active session' });
        });
    });

    describe('POST /user/register', () => {
        const validUser = {
            username: 'testuser',
            email: 'test@email.com',
            password_hash: 'testpassword',
            role: 'user',
            display_name: 'Test User',
            manager_id: 1
        };

        it('returns 201 if user registration is successful', async () => {
            // Reset mocks to ensure clean state
            pool.query.mockReset();

            // Set up mock behavior for each query in sequence
            pool.query
                .mockResolvedValueOnce({ rowCount: 0 }) // username check
                .mockResolvedValueOnce({ rowCount: 0 }) // email check
                .mockResolvedValueOnce({ rows: [validUser] }); // insert user

            const response = await request(app)
                .post('/user/register')
                .send(validUser);

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('User registered successfully');
        });

        it('returns 500 if database error occurs', async () => {
            // Reset mocks to ensure clean state
            pool.query.mockReset();

            // Mock the first two queries to succeed and the third to fail
            pool.query
                .mockResolvedValueOnce({ rowCount: 0 }) // username check
                .mockResolvedValueOnce({ rowCount: 0 }) // email check
                .mockRejectedValueOnce(new Error('Database error')); // insert fails

            const response = await request(app)
                .post('/user/register')
                .send(validUser);

            expect(response.statusCode).toBe(500);
            expect(response.body.message).toBe('Error adding user.');
        });
    });

    describe('PUT /user/updateRole/:id', () => {
        it('returns status code 200 if user role was updated successfully', async () => {
            // Reset mocks to ensure clean state
            pool.query.mockReset();

            const updatedUser = {
                id: 1,
                username: 'testuser',
                email: 'testemail',
                password_hash: 'testpassword',
                role: 'updatedrole',
                display_name: 'testdisplayname',
                manager_id: '1'
            };

            // Mock both queries in sequence
            pool.query
                .mockResolvedValueOnce({
                    rows: [sampleUser],
                    rowCount: 1  // First query - check if user exists
                })
                .mockResolvedValueOnce({
                    rows: [updatedUser]  // Second query - update user role
                });

            const response = await request(app)
                .put('/user/updateRole/1')
                .send({ role: 'updatedrole' });

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(updatedUser);
        });

        it('returns status code 404 if user is not found', async () => {
            // Reset mocks to ensure clean state
            pool.query.mockReset();

            pool.query.mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            });

            const response = await request(app)
                .put('/user/updateRole/999')
                .send({ role: 'updatedrole' });

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });

        it('returns status code 500 if database error occurs', async () => {
            // Reset mocks to ensure clean state
            pool.query.mockReset();

            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .put('/user/updateRole/1')
                .send({ role: 'updatedrole' });

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Something went wrong while updating user role' });
        });
    });
    // it('returns status code 200 if session is active', async () => {
    //     //first add the user in the database, then log them in, then check if session is 200
    //     pool.query.mockResolvedValueOnce({
    //         rows: [sampleUser],
    //         rowCount: 1
    //     });

    //     const response = await request(app)
    //         .post('/user/add')
    //         .send(sampleUser);

    //     expect(response.statusCode).toBe(201);

    //     // now see if the user can log in
    //     pool.query.mockResolvedValueOnce({
    //         rows: [sampleUser],
    //         rowCount: 1
    //     });

    //     const loginResponse = await request(app)
    //         .post('/user/login')
    //         .send({ username: 'testuser', password_hash: 'testpassword' });

    //     expect(loginResponse.statusCode).toBe(200);

    //     // TODO: Fix this test, find out why it's failing...
    //     // now check if the session is active
    //     // pool.query.mockResolvedValueOnce({
    //     //     rows: [sampleUser],
    //     //     rowCount: 1
    //     // });
    //     // const sessionResponse = await request(app)
    //     //     .get('/user/session');

    //     // expect(sessionResponse.statusCode).toBe(200);

    // });
});