const rolesRepository = require('./roles-repository');

async function createRoles(roles) {
    return rolesRepository.createRoles(roles);
}

async function getRoles(serviceId) {
    return rolesRepository.getRoles(serviceId);
}

async function getAllRoles() {
    return rolesRepository.getAllRoles();
}

async function getRole(id) {
    return rolesRepository.getRole(id);
}

async function deleteRoles(serviceId) {
    // Due to ON DELETE CASCADE on the postgres tables, assignments are
    // automatically deleted when roles are deleted!
    return rolesRepository.deleteRoles(serviceId);
}

async function increaseRoleSpotsFilled(id) {
    return rolesRepository.increaseRoleSpotsFilled(id);
}

async function getAssignedUsersForRoles(serviceId) {
    return rolesRepository.getAssignedUsersForRoles(serviceId);
}

module.exports = {
    createRoles,
    getRoles,
    getAllRoles,
    getRole,
    deleteRoles,
    increaseRoleSpotsFilled,
    getAssignedUsersForRoles,
};
