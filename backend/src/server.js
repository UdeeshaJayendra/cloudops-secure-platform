const express = require("express");
const pool = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        service: "CloudOps Secure Platform API",
        status: "running"
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "healthy"
    });
});

app.get("/db-health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            database: "connected"
        });
    } catch (error) {
        res.status(500).json({
            database: "disconnected"
        });
    }
});

app.get("/info", (req, res) => {
    res.json({
        project: "CloudOps Secure Platform",
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0"
    });
});

app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
});