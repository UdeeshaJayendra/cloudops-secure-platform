const request = require("supertest");

jest.mock("../src/config/database", () => ({
    query: jest.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }),
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
    end: jest.fn()
}));

const app = require("../src/server");

describe("Health API", () => {
    test("GET /health should return healthy status", async () => {
        const response = await request(app).get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("healthy");
    });

    test("GET / should return running status", async () => {
        const response = await request(app).get("/");

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("running");
    });

    test("GET unknown route should return 404", async () => {
        const response = await request(app).get("/does-not-exist");

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Route not found");
    });
});