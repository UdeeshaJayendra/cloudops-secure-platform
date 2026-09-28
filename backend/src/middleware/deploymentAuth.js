const deploymentAuth = (req, res, next) => {
    const expectedToken = process.env.DEPLOYMENT_CALLBACK_TOKEN;
    const providedToken = req.headers["x-deployment-token"];

    if (!expectedToken) {
        return res.status(500).json({
            error: "Deployment callback token is not configured"
        });
    }

    if (!providedToken || providedToken !== expectedToken) {
        return res.status(401).json({
            error: "Unauthorized deployment callback"
        });
    }

    next();
};

module.exports = deploymentAuth;