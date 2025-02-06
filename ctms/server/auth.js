const isAuthenticated = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).json({ message: 'User is not authenticated' });
    }
    next();
};

const isAdmin = (req, res, next) => {
    // First check if user is authenticated
    if (!req.session?.user) {
        return res.status(401).json({ message: 'User is not authenticated' });
    }

    // Then check if user has admin role if not, return 403 Forbidden
    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access is required to see this page' });
    }

    next();
};

module.exports = { isAuthenticated, isAdmin };