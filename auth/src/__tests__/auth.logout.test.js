const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "testsecret";

// Mock redis
jest.mock("../db/redis.db.js", () => ({
  set: jest.fn().mockResolvedValue("OK"),
}));

describe("GET /api/auth/logout", () => {

  it("should logout user and clear the token cookie", async () => {

    const token = jwt.sign(
      { id: "123", username: "test", email: "test@test.com" },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get("/api/auth/logout")
      .set("Cookie", [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged Out sucessfully!");
    expect(res.headers["set-cookie"][0]).toContain("token=;");
  });

});
