const express = require("express");
const pool = require("./config/database");
const taskService = require("./services/taskService");

const validateRequiredFields = require("./middleware/validate");
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const helmet = require("helmet");
const cors = require("cors");

app.use(express.json());

app.use(helmet());

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*"
}));

app.use(express.json({
    limit: "10kb"
}));

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

app.get("/metadata", (req, res) => {
    res.json({
        service: "cloudops-backend",
        version: "1.0.0",
        environment: NODE_ENV,
        runtime: "Node.js",
        platform: process.platform,
        architecture: process.arch
    });
});
app.post(
    "/api/v1/config",
    validateRequiredFields(["name", "value"]),
    (req, res) => {
        const { name, value } = req.body;

        res.status(201).json({
            message: "Configuration accepted",
            configuration: {
                name,
                value
            }
        });
    }
);
app.get("/api/v1/db/stats", (req, res) => {
    res.json({
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingRequests: pool.waitingCount
    });
});

app.post("/api/v1/tasks", async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                error: "Task title is required"
            });
        }

        const task = await taskService.createTask(title, description);

        res.status(201).json(task);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to create task"
        });
    }
});

app.get("/api/v1/tasks", async (req, res) => {
    try {
        const tasks = await taskService.getTasks();

        res.json({
            count: tasks.length,
            tasks
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to retrieve tasks"
        });
    }
});
app.get("/api/v1/tasks/:id", async (req, res) => {
    try {
        const task = await taskService.getTaskById(req.params.id);

        if (!task) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json(task);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to retrieve task"
        });
    }
});

app.put("/api/v1/tasks/:id", async (req, res) => {
    try {
        const { title, description, status } = req.body;

        if (!title || !status) {
            return res.status(400).json({
                error: "Title and status are required"
            });
        }

        const task = await taskService.updateTask(
            req.params.id,
            title,
            description,
            status
        );

        if (!task) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json(task);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to update task"
        });
    }
});

app.delete("/api/v1/tasks/:id", async (req, res) => {
    try {
        const task = await taskService.deleteTask(req.params.id);

        if (!task) {
            return res.status(404).json({
                error: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully",
            task
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete task"
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl
    });
});

let server;

if (require.main === module) {
    server = app.listen(PORT, () => {
        console.log(`Backend API running on port ${PORT}`);
    });
}

const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);

    if (server) {
    server.close(async () => {
        await pool.end();
        console.log("Database connection closed.");
        process.exit(0);
    });
    }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = app;