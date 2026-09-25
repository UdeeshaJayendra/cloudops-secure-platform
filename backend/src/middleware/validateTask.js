const allowedStatuses = [
    "pending",
    "in_progress",
    "completed"
];

const validateTask = (req, res, next) => {
    const { title, status } = req.body;

    if (req.method === "POST" && !title) {
        return res.status(400).json({
            error: "Task title is required"
        });
    }

    if (req.method === "PUT") {
        if (!title || !status) {
            return res.status(400).json({
                error: "Title and status are required"
            });
        }
    }

    if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid task status",
            allowedStatuses
        });
    }

    next();
};

module.exports = validateTask;