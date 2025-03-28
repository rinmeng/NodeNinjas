const devMode = false;

// For normal authentication, we check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (!req.session?.user && !devMode) {
        return res.status(401).json({ message: 'User is not authenticated' });
    }
    next();
};

// For admin authentication, we check if the user is authenticated and has the admin role
const isAuthAsAdmin = (req, res, next) => {
    // First check if user is authenticated
    if (!devMode) {
        if (!req.session?.user) {
            return res.status(401).json({ message: 'User is not authenticated' });
        }

        // Then check if user has admin role if not, return 403 Forbidden
        if (req.session.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access is required to see this page' });
        }
    }

    next();
};

module.exports = { isAuthenticated, isAuthAsAdmin };