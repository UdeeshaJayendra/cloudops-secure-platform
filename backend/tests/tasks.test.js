const request = require("supertest");

jest.mock("../src/services/taskService", () => ({
    createTask: jest.fn(),
    getTasks: jest.fn(),
    getTaskById: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn()
}));

const taskService = require("../src/services/taskService");
const app = require("../src/server");

describe("Task API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("POST /api/v1/tasks should create a task", async () => {
        taskService.createTask.mockResolvedValue({
            id: 1,
            title: "Test Task",
            description: "Testing",
            status: "pending"
        });

        const response = await request(app)
            .post("/api/v1/tasks")
            .send({
                title: "Test Task",
                description: "Testing",
                status: "pending"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe("Test Task");
    });

    test("POST /api/v1/tasks should reject missing title", async () => {
        const response = await request(app)
            .post("/api/v1/tasks")
            .send({
                description: "No title"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Task title is required");
    });

    test("POST /api/v1/tasks should reject non-string title", async () => {
        const response = await request(app)
            .post("/api/v1/tasks")
            .send({
                title: 123
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Task title must be a string");
    });

    test("POST /api/v1/tasks should reject whitespace-only title", async () => {
        const response = await request(app)
            .post("/api/v1/tasks")
            .send({
                title: "   "
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Task title cannot be empty");
    });

    test("POST /api/v1/tasks should reject title longer than 100 characters", async () => {
        const response = await request(app)
            .post("/api/v1/tasks")
            .send({
                title: "A".repeat(101)
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "Task title must not exceed 100 characters"
        );
    });

    test("POST /api/v1/tasks should reject description longer than 500 characters", async () => {
        const response = await request(app)
            .post("/api/v1/tasks")
            .send({
                title: "Valid Task",
                description: "A".repeat(501)
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            "Task description must not exceed 500 characters"
        );
    });

    test("POST /api/v1/tasks should reject invalid status", async () => {
        const response = await request(app)
            .post("/api/v1/tasks")
            .send({
                title: "Invalid Task",
                status: "banana"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Invalid task status");
    });

    test("GET /api/v1/tasks should return tasks", async () => {
        taskService.getTasks.mockResolvedValue([
            {
                id: 1,
                title: "Test Task",
                description: "Testing",
                status: "pending"
            }
        ]);

        const response = await request(app)
            .get("/api/v1/tasks");

        expect(response.statusCode).toBe(200);
        expect(response.body.count).toBe(1);
        expect(response.body.tasks).toHaveLength(1);
    });

    test("GET /api/v1/tasks/:id should return a task", async () => {
        taskService.getTaskById.mockResolvedValue({
            id: 1,
            title: "Test Task",
            description: "Testing",
            status: "pending"
        });

        const response = await request(app)
            .get("/api/v1/tasks/1");

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(1);
    });

    test("GET /api/v1/tasks/:id should return 404 when task does not exist", async () => {
        taskService.getTaskById.mockResolvedValue(undefined);

        const response = await request(app)
            .get("/api/v1/tasks/999");

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Task not found");
    });

    test("PUT /api/v1/tasks/:id should update a task", async () => {
        taskService.updateTask.mockResolvedValue({
            id: 1,
            title: "Updated Task",
            description: "Updated",
            status: "completed"
        });

        const response = await request(app)
            .put("/api/v1/tasks/1")
            .send({
                title: "Updated Task",
                description: "Updated",
                status: "completed"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("completed");
    });

    test("DELETE /api/v1/tasks/:id should delete a task", async () => {
        taskService.deleteTask.mockResolvedValue({
            id: 1,
            title: "Test Task",
            status: "pending"
        });

        const response = await request(app)
            .delete("/api/v1/tasks/1");

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Task deleted successfully");
    });
});