const app = require('../../server');
const request = require('supertest');
const pool = require('../../db');

// Mock the database pool
jest.mock('../../db', () => ({
    query: jest.fn()
}));



describe('User Routes', () => {
    // Add server variable to store server instance
    let server;

    beforeAll(() => {
        // Start server before all tests
        server = app.listen();
    });

    afterAll((done) => {
        // Close server after all tests
        if (server) {
            server.close(done);
        } else {
            done();
        }
    });

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    const sampleUser = {
        id: 1,
        username: 'testuser',
        email: 'testemail',
        password_hash: 'testpassword',
        role: 'testrole',
        display_name: 'testdisplayname',
        manager_id: '1'
    };

    describe('POST /user/add', () => {
        const validUser = {
            username: 'testuser',
            email: 'testemail',
            password_hash: 'testpassword',
            role: 'testrole',
            display_name: 'testdisplayname',
            manager_id: '1'
        };

        it('returns status code 201 if user was added successfully', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [validUser]
            });

            const response = await request(app)
                .post('/user/add')
                .send(validUser);

            expect(response.statusCode).toBe(201);
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(validUser);
        });

        it('returns status code 500 if database error occurs', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/user/add')
                .send(validUser);

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Error adding user.' });
        });

        it('returns status code 400 if required fields are missing', async () => {
            const invalidUser = {
                username: 'testuser'
            };

            const response = await request(app)
                .post('/user/add')
                .send(invalidUser);

            expect(response.statusCode).toBe(400);
        });
    });

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

        it('returns status code 200 if user was updated successfully', async () => {
            // Mock the select query to find the user
            pool.query
                .mockResolvedValueOnce({
                    rows: [validUpdateUser],
                    rowCount: 1
                })
                // Mock the update query
                .mockResolvedValueOnce({
                    rows: [validUpdateUser]
                });

            const response = await request(app)
                .put('/user/update/1')
                .send(validUpdateUser);

            expect(response.statusCode).toBe(200);
            expect(pool.query).toHaveBeenCalledTimes(2);
            expect(response.body).toEqual(validUpdateUser);
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

    // Logout routes and sessions needs to have tests written. 
    // Currently both works out fine if we check
    // but Rin does not know how to write tests for them since Cookies
    // are involved, I think the issue may be that the session cannot mock cookies.
    // I will try again and write the tests for them and see if they work.

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

});