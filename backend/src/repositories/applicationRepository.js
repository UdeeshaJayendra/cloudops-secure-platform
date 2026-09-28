const pool = require("../config/database");

const getApplications = async () => {
    const result = await pool.query(
        `SELECT
            id,
            name,
            image,
            environment,
            current_version,
            desired_version,
            status,
            created_at,
            updated_at
         FROM applications
         ORDER BY name`
    );

    return result.rows;
};

const getApplicationById = async (id) => {
    const result = await pool.query(
        `SELECT
            id,
            name,
            image,
            environment,
            current_version,
            desired_version,
            status,
            created_at,
            updated_at
         FROM applications
         WHERE id = $1`,
        [id]
    );

    return result.rows[0];
};

const getDeployments = async (applicationId) => {
    const result = await pool.query(
        `SELECT
            id,
            application_id,
            version,
            environment,
            status,
            deployed_at
         FROM deployments
         WHERE application_id = $1
         ORDER BY deployed_at DESC`,
        [applicationId]
    );

    return result.rows;
};

const createDeployment = async (
    applicationId,
    version,
    environment,
    status
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const deploymentResult = await client.query(
            `INSERT INTO deployments
                (application_id, version, environment, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [applicationId, version, environment, status]
        );

await client.query(
    `UPDATE applications
     SET
         desired_version = $1,
         environment = $2,
         status = 'deploying',
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [version, environment, applicationId]
);
        await client.query("COMMIT");

        return deploymentResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getApplications,
    getApplicationById,
    getDeployments,
    createDeployment
};