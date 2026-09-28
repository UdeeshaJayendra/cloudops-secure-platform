const axios = require("axios");

const JENKINS_URL =
    process.env.JENKINS_URL || "http://host.docker.internal:8083";

const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_TOKEN = process.env.JENKINS_TOKEN;

const JOB_NAME = "cloudops-secure-platform";

const triggerDeployment = async ({
    application,
    version,
    environment
}) => {
    if (!JENKINS_USER || !JENKINS_TOKEN) {
        throw new Error("Jenkins credentials are not configured");
    }

    const params = new URLSearchParams({
        APPLICATION: application,
        VERSION: version,
        ENVIRONMENT: environment
    });

    const response = await axios.post(
        `${JENKINS_URL}/job/${JOB_NAME}/buildWithParameters?${params.toString()}`,
        {},
        {
            auth: {
                username: JENKINS_USER,
                password: JENKINS_TOKEN
            },
            validateStatus: (status) =>
                status >= 200 && status < 400
        }
    );

    return {
        status: response.status,
        queueUrl: response.headers.location || null
    };
};

module.exports = {
    triggerDeployment
};