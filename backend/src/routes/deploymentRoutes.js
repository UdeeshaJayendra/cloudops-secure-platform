const express = require("express");
const applicationRepository = require("../repositories/applicationRepository");
const deploymentAuth = require("../middleware/deploymentAuth");

const router = express.Router();

router.post("/:id/status", deploymentAuth, async (req, res) => {
    try {
        const { status, version } = req.body;

        if (!status) {
            return res.status(400).json({
                error: "Deployment status is required"
            });
        }

        if (!["successful", "failed"].includes(status)) {
            return res.status(400).json({
                error: "Invalid deployment status"
            });
        }

        if (status === "successful" && !version) {
            return res.status(400).json({
                error: "Version is required for successful deployment"
            });
        }

        const deployment =
            status === "successful"
                ? await applicationRepository.markDeploymentSuccessful(
                    req.params.id,
                    version
                )
                : await applicationRepository.markDeploymentFailed(
                    req.params.id
                );

        if (!deployment) {
            return res.status(404).json({
                error: "Deployment not found"
            });
        }

        res.json({
            message: `Deployment marked as ${status}`,
            deployment
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to update deployment status"
        });
    }
});

module.exports = router;