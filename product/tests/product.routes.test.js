
const request = require("supertest");
jest.mock("../src/middleware/auth.middleware.js", () => ({
  CreateAuthMiddleware: () => (req, res, next) => {
    req.user = { id: "testUserId", role: "seller" };
    next();
  },
}));

jest.mock("../services/imagekit.service", () => ({
  uploadImage: jest.fn().mockResolvedValue({
    url: "test-url",
    thumbnail: "test-thumb",
    id: "test-id",
  }),
}));

jest.mock("../models/product.model", () => ({
  create: jest.fn().mockResolvedValue({
    _id: "123",
    title: "Test Product",
    description: "Test Description",
    price: { amount: 100, currency: "INR" },
    seller: "testUserId",
    images: [{ url: "test-url" }],
  }),
}));


const app = require("../src/app"); 

describe("POST /api/products/", () => {
  const validToken = "Bearer YOUR_TEST_TOKEN";

  it("should create product with valid data", async () => {
    const res = await request(app)
      .post("/api/products/")
      .set("Authorization", validToken)
      .field("title", "Test Product")
      .field("description", "Test Description")
      .field("priceAmount", "100")
      .field("priceCurrency", "INR")
      .attach("images", Buffer.from("test file content"), "test.png");

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty("title", "Test Product");
    expect(res.body.data.images.length).toBeGreaterThan(0);
  });

  it("should fail if title is missing", async () => {
    const res = await request(app)
      .post("/api/products/")
      .set("Authorization", validToken)
      .field("priceAmount", "100")
      .attach("images", Buffer.from("test file content"), "test.png");

    expect(res.statusCode).toBe(400);
  });

  it("should fail if priceAmount <= 0", async () => {
    const res = await request(app)
      .post("/api/products/")
      .set("Authorization", validToken)
      .field("title", "Test Product")
      .field("priceAmount", "-10")
      .attach("images", Buffer.from("test file content"), "test.png");

    expect(res.statusCode).toBe(400);
  });

  it("should fail without authentication", async () => {
    const res = await request(app)
      .post("/api/products/")
      .field("title", "Test Product")
      .field("priceAmount", "100")
      .attach("images", Buffer.from("test file content"), "test.png");

    expect(res.statusCode).toBe(401);
  });
});
