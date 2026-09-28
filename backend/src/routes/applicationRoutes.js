const express = require("express");
const applicationRepository = require("../repositories/applicationRepository");
const jenkinsService = require("../services/jenkinsService");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const applications =
            await applicationRepository.getApplications();

        res.json({
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to retrieve applications"
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const application =
            await applicationRepository.getApplicationById(
                req.params.id
            );

        if (!application) {
            return res.status(404).json({
                error: "Application not found"
            });
        }

        const deployments =
            await applicationRepository.getDeployments(
                req.params.id
            );

        res.json({
            application,
            deployments
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to retrieve application"
        });
    }
});

router.post("/:id/deploy", async (req, res) => {
    try {
        const { version, environment } = req.body;

        if (!version || !environment) {
            return res.status(400).json({
                error: "Version and environment are required"
            });
        }

        const application =
            await applicationRepository.getApplicationById(
                req.params.id
            );

        if (!application) {
            return res.status(404).json({
                error: "Application not found"
            });
        }

        const deployment =
            await applicationRepository.createDeployment(
                application.id,
                version,
                environment,
                "pending"
            );

        try {
            const jenkins =
                await jenkinsService.triggerDeployment({
                    application: application.name === "CloudOps Backend"
                        ? "cloudops-backend"
                        : "cloudops-frontend",
                    version,
                    environment,
                    deploymentId: deployment.id
                });

            return res.status(201).json({
                message: "Deployment created and Jenkins pipeline triggered",
                deployment,
                jenkins
            });
        } catch (jenkinsError) {
            console.error(
                "Jenkins deployment trigger failed:",
                jenkinsError.message
            );

            return res.status(502).json({
                error: "Deployment created but Jenkins pipeline could not be triggered",
                deployment
            });
        }
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create deployment"
        });
    }
});

router.post("/:id/status", async (req, res) => {
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