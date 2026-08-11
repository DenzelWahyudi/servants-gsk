const assignmentsService = require('./assignments-service');
const { getRole, increaseRoleSpotsFilled } = require('../roles/roles-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { getUser } = require('../users/users-service');

async function createAssignment(req, res, next) {
    try {
        const { userId, roleId } = req.body;
        const status = 'pending';
        if (!userId) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'User id empty!'
            );
        }
        if (!roleId) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Role id empty!'
            );
        }

        const role = await getRole(roleId);
        if (!role) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Role id invalid!'
            );
        }

        if (await assignmentsService.hasUserBeenAssigned(roleId, userId)) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Already signed up!'
            );
        }

        const success = await assignmentsService.createAssignment(
            userId,
            roleId,
            status
        );
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to create assignment.'
            );
        }

        return res.status(201).json({ message: 'Create assignment success!' });
    } catch (error) {
        next(error);
    }
}

async function adminCreateAssignment(req, res, next) {
    try {
        const { userId, roleId, status } = req.body;
        const user = await getUser(req.user.id);

        if (user.role !== 'admin') {
            throw errorResponder(
                errorTypes.INVALID_CREDENTIALS,
                'User not admin'
            );
        }

        if (!userId) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'User id empty!'
            );
        }
        if (!roleId) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Role id empty!'
            );
        }

        const role = await getRole(roleId);
        if (!role) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Role id invalid!'
            );
        }

        if (await assignmentsService.hasUserBeenAssigned(roleId, userId)) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Already signed up!'
            );
        }

        if (status === 'confirmed') await increaseRoleSpotsFilled(roleId);

        const success = await assignmentsService.createAssignment(
            userId,
            roleId,
            status
        );
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to create assignment.'
            );
        }

        return res.status(201).json({ message: 'Create assignment success!' });
    } catch (error) {
        next(error);
    }
}

async function getUserSchedule(req, res, next) {
    try {
        const userId = req.user.id;

        const success = await assignmentsService.getUserSchedule(userId);

        if (!success.length) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get user schedule'
            );
        }

        return res.status(200).json(success);
    } catch (error) {
        next(error);
    }
}

async function getPendingStatusAssignments(req, res, next) {
    try {
        const success = await assignmentsService.getPendingStatusAssignments();

        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get pending status assignments'
            );
        }

        return res.status(200).json(success);
    } catch (error) {
        next(error);
    }
}

async function updateStatus(req, res, next) {
    try {
        const assignmentId = req.params.id;
        const { status, roleId } = req.body;
        const user = await getUser(req.user.id);

        if (user.role !== 'admin') {
            throw errorResponder(
                errorTypes.INVALID_CREDENTIALS,
                'User not admin'
            );
        }

        if (!assignmentId) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Assignment id empty'
            );
        }

        if (!status) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Status type empty'
            );
        }

        if (status === 'confirmed') await increaseRoleSpotsFilled(roleId);

        const success = await assignmentsService.updateStatus(
            assignmentId,
            status
        );

        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to update assignment status'
            );
        }

        return res.status(200).json(success);
    } catch (error) {
        next(error);
    }
}

async function getAllUserAssignments(req, res, next) {
    try {
        const success = await assignmentsService.getAllUserAssignments(
            req.user.id
        );

        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get user assignments'
            );
        }

        return res.status(200).json(success);
    } catch (error) {
        next(error);
    }
}

async function getUsersToRelieve(req, res, next) {
    try {
        const roleId = req.params.roleId;

        const success = await assignmentsService.getUsersToRelieve(roleId);

        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get users'
            );
        }

        return res.status(200).json(success);
    } catch (error) {
        next(error);
    }
}

async function relieveUser(req, res, next) {
    try {
        const { userId, roleId } = req.body;
        const user = await getUser(req.user.id);

        if (user.role !== 'admin') {
            throw errorResponder(
                errorTypes.INVALID_CREDENTIALS,
                'User not admin'
            );
        }

        const success = await assignmentsService.relieveUser(userId, roleId);

        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to relieve user'
            );
        }

        return res.status(200).json({ message: 'Relieve user successful' });
    } catch (error) {
        next(error);
    }
}

async function getAllUserAssignedServices(req, res, next) {
    try {
        const userId = req.user.id;

        const success =
            await assignmentsService.getAllUserAssignedServices(userId);
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get assigned services.'
            );
        }

        return res.status(200).json(success);
    } catch (error) {
        next(error);
    }
}

async function getGroupDetails(req, res, next) {
    try {
        const serviceId = req.params.serviceId;

        const success = await assignmentsService.getGroupDetails(serviceId);
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get group details.'
            );
        }

        return res.status(200).json(success);
    } catch (error) {
        next(error);
    }
}

async function getGroupMemberNames(req, res, next) {
    try {
        const serviceId = req.params.serviceId;

        const success = await assignmentsService.getGroupMemberNames(serviceId);
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get group member names.'
            );
        }

        return res.status(200).json(success);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createAssignment,
    adminCreateAssignment,
    getUserSchedule,
    getPendingStatusAssignments,
    updateStatus,
    getAllUserAssignments,
    getUsersToRelieve,
    relieveUser,
    getAllUserAssignedServices,
    getGroupDetails,
    getGroupMemberNames,
};
