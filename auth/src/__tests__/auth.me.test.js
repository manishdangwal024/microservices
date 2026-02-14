process.env.JWT_SECRET = "testsecret";
const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/user.model");
const jwt = require("jsonwebtoken");

describe("GET /api/auth/me", () => {
  it("returns 200 and user info when provided a valid token", async () => {
    const user = await new User({
      username: "meuser",
      email: "meuser@example.com",
      password: "irrelevant",
      fullName: { firstName: "Me", lastName: "User" },
    }).save();

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", [`token=${token}`]);
    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.username).toBe("meuser");
    expect(res.body.user.email).toBe("meuser@example.com");
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });

  it("returns 401 when token is invalid", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.status).toBe(401);
  });
});
