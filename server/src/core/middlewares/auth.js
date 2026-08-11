const jwt = require('jsonwebtoken');
const { errorResponder, errorTypes } = require('../errors');

function authMiddleware(request, response, next) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(
            errorResponder(errorTypes.NO_ANONYMOUS_ACCESS, 'No token provided')
        );
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.user = decoded; // { id, name, role }
        return next();
    } catch {
        return next(
            errorResponder(errorTypes.TOKEN_VERIFY, 'Invalid or expired token')
        );
    }
}

module.exports = authMiddleware;
