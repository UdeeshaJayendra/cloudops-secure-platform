const taskRepository = require("../repositories/taskRepository");

const createTask = async (title, description) => {
    return await taskRepository.createTask(title, description);
};

const getTasks = async () => {
    return await taskRepository.getTasks();
};

module.exports = {
    createTask,
    getTasks
};