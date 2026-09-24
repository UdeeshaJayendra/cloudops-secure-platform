const pool = require("../config/database");

const createTask = async (title, description) => {
    const result = await pool.query(
        `INSERT INTO tasks (title, description)
         VALUES ($1, $2)
         RETURNING *`,
        [title, description]
    );

    return result.rows[0];
};

const getTasks = async () => {
    const result = await pool.query(
        "SELECT * FROM tasks ORDER BY created_at DESC"
    );

    return result.rows;
};

const getTaskById = async (id) => {
    const result = await pool.query(
        "SELECT * FROM tasks WHERE id = $1",
        [id]
    );

    return result.rows[0];
};

const updateTask = async (id, title, description, status) => {
    const result = await pool.query(
        `UPDATE tasks
         SET title = $1,
             description = $2,
             status = $3
         WHERE id = $4
         RETURNING *`,
        [title, description, status, id]
    );

    return result.rows[0];
};

const deleteTask = async (id) => {
    const result = await pool.query(
        "DELETE FROM tasks WHERE id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};