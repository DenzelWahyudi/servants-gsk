const assignmentsRepository = require('./assignments-repository');
const rolesRepository = require('../roles/roles-repository');

async function createAssignment(userId, roleId, status) {
    return assignmentsRepository.createAssignment(userId, roleId, status);
}

async function hasUserBeenAssigned(roleId, userId) {
    return assignmentsRepository.hasUserBeenAssigned(roleId, userId);
}

async function getUserSchedule(userId) {
    return assignmentsRepository.getUserSchedule(userId);
}

async function getPendingStatusAssignments() {
    return assignmentsRepository.getPendingStatusAssignments();
}

async function updateStatus(assignmentId, status) {
    return assignmentsRepository.updateStatus(assignmentId, status);
}

async function getAllUserAssignments(userId) {
    return assignmentsRepository.getAllUserAssignments(userId);
}

async function getUsersToRelieve(roleId) {
    return assignmentsRepository.getUsersToRelieve(roleId);
}

async function relieveUser(userId, roleId) {
    await rolesRepository.decreaseRoleSpotsFilled(roleId);
    return assignmentsRepository.relieveUser(userId, roleId);
}

async function getAllUserAssignedServices(userId) {
    return assignmentsRepository.getAllUserAssignedServices(userId);
}

async function getGroupDetails(serviceId) {
    return assignmentsRepository.getGroupDetails(serviceId);
}

async function getGroupMemberNames(serviceId) {
    return assignmentsRepository.getGroupMemberNames(serviceId);
}

module.exports = {
    createAssignment,
    hasUserBeenAssigned,
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
