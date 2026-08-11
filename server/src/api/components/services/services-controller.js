const servicesService = require('./services-service');
const { createRoles, deleteRoles } = require('../roles/roles-service');
const { deleteFiles } = require('../chats/chats-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { getUser } = require('../users/users-service');

async function createService(req, res, next) {
    try {
        const { name, date, time, status, roles } = req.body;
        const user = await getUser(req.user.id);

        if (user.role !== 'admin') {
            throw errorResponder(
                errorTypes.INVALID_CREDENTIALS,
                'User not admin'
            );
        }

        if (!name) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Service name is required'
            );
        }
        if (!date) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Date is required'
            );
        }
        if (!time) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Time is required'
            );
        }
        if (!status) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Status is required'
            );
        }

        if (roles.some((role) => !role.name)) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Role name is required'
            );
        }

        const serviceSuccess = await servicesService.createService(
            name,
            date,
            time,
            status
        );
        if (!serviceSuccess) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to create service'
            );
        }
        const serviceId = serviceSuccess.id;

        if (roles) {
            const rolesBody = roles.map((role) => ({
                serviceId,
                name: role.name,
                spotsTotal: role.spotsTotal,
                spotsFilled: 0,
            }));

            const rolesSuccess = await createRoles(rolesBody);
            if (!rolesSuccess) {
                throw errorResponder(
                    errorTypes.UNPROCESSABLE_ENTITY,
                    'Failed to create roles'
                );
            }
        }

        return res
            .status(201)
            .json({ message: 'Service created successfully' });
    } catch (error) {
        return next(error);
    }
}

async function getServices(req, res, next) {
    try {
        const services = await servicesService.getServices();
        if (!services) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get services'
            );
        }
        return res.status(200).json(services);
    } catch (error) {
        return next(error);
    }
}

async function getService(req, res, next) {
    try {
        const serviceId = req.params.id;
        const success = await servicesService.getService(serviceId);
        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get service'
            );
        }
        return res.status(200).json(success);
    } catch (error) {
        return next(error);
    }
}

async function deleteService(req, res, next) {
    try {
        const serviceId = req.params.serviceId;
        const service = await servicesService.getService(serviceId);
        const user = await getUser(req.user.id);

        if (user.role !== 'admin') {
            throw errorResponder(
                errorTypes.INVALID_CREDENTIALS,
                'User not admin'
            );
        }

        if (!service) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get service'
            );
        }

        const successRoles = await deleteRoles(serviceId);
        if (!successRoles) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to delete roles'
            );
        }

        const successFiles = await deleteFiles(serviceId);
        if (!successFiles) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to delete files'
            );
        }

        const successService = await servicesService.deleteService(serviceId);
        if (!successService) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to delete service'
            );
        }

        return res
            .status(201)
            .json({ message: 'Service deleted successfully' });
    } catch (error) {
        return next(error);
    }
}

async function updateService(req, res, next) {
    try {
        const serviceId = req.params.serviceId;
        const { name, date, time, status, roles } = req.body;
        const user = await getUser(req.user.id);

        if (user.role !== 'admin') {
            throw errorResponder(
                errorTypes.INVALID_CREDENTIALS,
                'User not admin'
            );
        }

        if (!name) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Service name is required'
            );
        }
        if (!date) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Date is required'
            );
        }
        if (!time) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Time is required'
            );
        }
        if (!status) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Status is required'
            );
        }

        if (roles.some((role) => !role.name)) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Role name is required'
            );
        }

        const service = await servicesService.getService(serviceId);
        if (!service) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get service'
            );
        }

        const successRoles = await deleteRoles(serviceId);
        if (!successRoles) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to delete roles'
            );
        }

        const successFiles = await deleteFiles(serviceId);
        if (!successFiles) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to delete files'
            );
        }

        const successService = await servicesService.updateService(
            serviceId,
            name,
            date,
            time,
            status
        );
        if (!successService) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to update service'
            );
        }

        if (roles) {
            const rolesBody = roles.map((role) => ({
                serviceId,
                name: role.name,
                spotsTotal: role.spotsTotal,
                spotsFilled: 0,
            }));

            const rolesSuccess = await createRoles(rolesBody);
            if (!rolesSuccess) {
                throw errorResponder(
                    errorTypes.UNPROCESSABLE_ENTITY,
                    'Failed to update roles'
                );
            }
        }

        return res
            .status(200)
            .json({ message: 'Service updated successfully' });
    } catch (error) {
        return next(error);
    }
}

async function updateStatus(req, res, next) {
    try {
        const { status } = req.body;
        const user = await getUser(req.user.id);

        if (user.role !== 'admin') {
            throw errorResponder(
                errorTypes.INVALID_CREDENTIALS,
                'User not admin'
            );
        }

        const success = await servicesService.updateStatus(
            req.params.serviceId,
            status
        );

        if (!success) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to update service status'
            );
        }

        return res
            .status(200)
            .json({ message: 'Update service status success!' });
    } catch (error) {
        next(error);
    }
}

async function getServicesWithRoles(req, res, next) {
    try {
        const services = await servicesService.getServicesWithRoles();
        if (!services) {
            throw errorResponder(
                errorTypes.UNPROCESSABLE_ENTITY,
                'Failed to get services'
            );
        }
        return res.status(200).json(services);
    } catch (error) {
        return next(error);
    }
}

async function getServiceWithRoles(req, res, next) {
    try {
        const service = await servicesService.getServiceWithRoles(
            req.params.id
        );
        const user = await getUser(req.user.id);

        if (user.role !== 'admin') {
            throw errorResponder(
                errorTypes.INVALID_CREDENTIALS,
                'User not admin'
            );
        }

        if (!service) {
            throw errorResponder(errorTypes.NOT_FOUND, 'Service not found');
        }
        return res.status(200).json(service);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createService,
    getServices,
    getService,
    deleteService,
    updateService,
    updateStatus,
    getServicesWithRoles,
    getServiceWithRoles,
};
