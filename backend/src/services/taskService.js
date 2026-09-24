const taskRepository = require("../repositories/taskRepository");

const createTask = async (title, description) => {
    return await taskRepository.createTask(title, description);
};

const getTasks = async () => {
    return await taskRepository.getTasks();
};

const getTaskById = async (id) => {
    return await taskRepository.getTaskById(id);
};

const updateTask = async (id, title, description, status) => {
    return await taskRepository.updateTask(
        id,
        title,
        description,
        status
    );
};

const deleteTask = async (id) => {
    return await taskRepository.deleteTask(id);
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};