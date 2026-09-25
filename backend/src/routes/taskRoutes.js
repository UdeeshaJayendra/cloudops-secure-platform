const express = require("express");
const taskService = require("../services/taskService");

const router = express.Router();
const validateTask = require("../middleware/validateTask");

router.post("/", validateTask, async (req, res) => {
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

router.get("/", async (req, res) => {
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

router.get("/:id", async (req, res) => {
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

router.put("/:id", validateTask, async (req, res) => {
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

router.delete("/:id", async (req, res) => {
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

module.exports = router;