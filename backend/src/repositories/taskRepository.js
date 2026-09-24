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

module.exports = {
    createTask,
    getTasks
};