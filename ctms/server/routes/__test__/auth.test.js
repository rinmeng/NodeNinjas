const { isAuthenticated, isAuthAsAdmin } = require('../../auth');

describe('Authentication Middleware', () => {
    // Mock response object
    let res;
    // Mock next function
    let next;

    beforeEach(() => {
        // Reset mocks before each test
        res = {
            status: jest.fn(() => res),
            json: jest.fn(() => res)
        };
        next = jest.fn();
    });

    describe('isAuthenticated', () => {
        test('should call next() if user is authenticated', () => {
            const req = { session: { user: { id: '123' } } };

            isAuthenticated(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 401 if user is not authenticated', () => {
            const req = { session: {} };

            isAuthenticated(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'User is not authenticated' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 401 if session is undefined', () => {
            const req = {};

            isAuthenticated(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'User is not authenticated' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('isAuthAsAdmin', () => {
        test('should call next() if user is authenticated and has admin role', () => {
            const req = { session: { user: { id: '123', role: 'admin' } } };

            isAuthAsAdmin(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 401 if user is not authenticated', () => {
            const req = { session: {} };

            isAuthAsAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'User is not authenticated' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 403 if user is authenticated but not an admin', () => {
            const req = { session: { user: { id: '123', role: 'user' } } };

            isAuthAsAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Admin access is required to see this page' });
            expect(next).not.toHaveBeenCalled();
        });
    });
});