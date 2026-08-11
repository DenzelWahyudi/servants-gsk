const rolesService = require('./roles-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

async function getRoles(req, res, next) {
    try {
        const serviceId = req.params.serviceId;
        const roles = await rolesService.getRoles(serviceId);
        if (!roles) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get roles'
            );
        }

        return res.status(200).json(roles);
    } catch (error) {
        return next(error);
    }
}

async function getAllRoles(req, res, next) {
    try {
        const success = await rolesService.getAllRoles();
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get all roles'
            );
        }
        return res.status(200).json(success);
    } catch (error) {
        return next(error);
    }
}

async function getAssignedUsersForRoles(req, res, next) {
    try {
        const serviceId = req.params.serviceId;

        const success = await rolesService.getAssignedUsersForRoles(serviceId);
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get users'
            );
        }

        return res.status(200).json(success);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getRoles,
    getAllRoles,
    getAssignedUsersForRoles,
};
