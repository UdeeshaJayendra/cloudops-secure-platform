const express = require("express");
const applicationRepository = require("../repositories/applicationRepository");

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

        res.status(201).json({
            message: "Deployment created",
            deployment
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create deployment"
        });
    }
});

module.exports = router;