const allowedStatuses = [
    "pending",
    "in_progress",
    "completed"
];

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

const validateTask = (req, res, next) => {
    const { title, description, status } = req.body;

    if (req.method === "POST" && !title) {
        return res.status(400).json({
            error: "Task title is required"
        });
    }

    if (req.method === "PUT" && (!title || !status)) {
        return res.status(400).json({
            error: "Title and status are required"
        });
    }

    if (title !== undefined) {
        if (typeof title !== "string") {
            return res.status(400).json({
                error: "Task title must be a string"
            });
        }

        if (title.trim().length === 0) {
            return res.status(400).json({
                error: "Task title cannot be empty"
            });
        }

        if (title.length > MAX_TITLE_LENGTH) {
            return res.status(400).json({
                error: `Task title must not exceed ${MAX_TITLE_LENGTH} characters`
            });
        }
    }

    if (description !== undefined && description !== null) {
        if (typeof description !== "string") {
            return res.status(400).json({
                error: "Task description must be a string"
            });
        }

        if (description.length > MAX_DESCRIPTION_LENGTH) {
            return res.status(400).json({
                error: `Task description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`
            });
        }
    }

    if (status !== undefined && !allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid task status",
            allowedStatuses
        });
    }

    next();
};

module.exports = validateTask;