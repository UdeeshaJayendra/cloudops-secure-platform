const axios = require("axios");

const JENKINS_URL =
    process.env.JENKINS_URL || "http://host.docker.internal:8083";

const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_TOKEN = process.env.JENKINS_TOKEN;

const JOB_NAME = "cloudops-secure-platform";

const auth = {
    username: JENKINS_USER,
    password: JENKINS_TOKEN
};

const triggerDeployment = async ({
    application,
    version,
    environment,
    deploymentId
}) => {
    if (!JENKINS_USER || !JENKINS_TOKEN) {
        throw new Error("Jenkins credentials are not configured");
    }

    const crumbResponse = await axios.get(
        `${JENKINS_URL}/crumbIssuer/api/json`,
        {
            auth
        }
    );

    const {
        crumbRequestField,
        crumb
    } = crumbResponse.data;

    const params = new URLSearchParams({
        APPLICATION: application,
        VERSION: version,
        ENVIRONMENT: environment,
        DEPLOYMENT_ID: String(deploymentId)
    });

    const response = await axios.post(
        `${JENKINS_URL}/job/${JOB_NAME}/buildWithParameters?${params.toString()}`,
        {},
        {
            auth,
            headers: {
                [crumbRequestField]: crumb
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