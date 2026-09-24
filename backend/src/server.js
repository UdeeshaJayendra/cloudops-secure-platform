const express = require("express");
const pool = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
        );
    });

    next();
});

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

app.get("/health/details", async (req, res) => {
    let database = "disconnected";

    try {
        await pool.query("SELECT 1");
        database = "connected";
    } catch (error) {
        database = "disconnected";
    }

    res.json({
        status: "healthy",
        service: "backend",
        database,
        environment: NODE_ENV,
        uptime: `${Math.floor(process.uptime())} seconds`
    });
});

app.get("/info", (req, res) => {
    res.json({
        project: "CloudOps Secure Platform",
        environment: NODE_ENV,
        version: "1.0.0"
    });
});

app.get("/api/v1/status", (req, res) => {
    res.json({
        api: "CloudOps Secure Platform",
        version: "v1",
        status: "operational"
    });
});
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl
    });
});

const server = app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
});

const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);

    server.close(async () => {
        await pool.end();
        console.log("Database connection closed.");
        process.exit(0);
    });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));