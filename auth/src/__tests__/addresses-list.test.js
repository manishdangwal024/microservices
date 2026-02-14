process.env.JWT_SECRET = "testsecret";
const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/user.model");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")


jest.mock("../db/redis.db.js", () => ({
  set: jest.fn().mockResolvedValue("OK"),
}));

describe("GET /api/auth/users/me/addresses", () => {
  it("returns 200 and list of saved addresses for authenticated user", async () => {
    const user = await new User({
      username: "addressuser",
      email: "addressuser@example.com",
      password: "irrelevant",
      fullName: { firstName: "Address", lastName: "User" },
      addresses: [
        {
          street: "123 Main St",
          city: "Town",
          state: "TS",
          zip: "12345",
          country: "Country",
        },
        {
          street: "456 Side St",
          city: "Village",
          state: "VS",
          zip: "67890",
          country: "Country",
        },
      ],
    }).save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .get("/api/auth/users/me/addresses")
      .set("Cookie", [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.addresses).toHaveLength(2);
    expect(res.body.addresses[0].street).toBe("123 Main St");
    expect(res.body.addresses[1].street).toBe("456 Side St");
  });

  it("returns 401 if not authenticated", async () => {
    const res = await request(app).get("/api/auth/users/me/addresses");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/users/me/addresses", () => {
  it("adds a new address for authenticated user with valid zip", async () => {
    const user = await new User({
      username: "addaddressuser",
      email: "addaddress@example.com",
      password: "irrelevant",
      fullName: { firstName: "Add", lastName: "Address" },
      addresses: [],
    }).save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const newAddress = {
      street: "New St",
      city: "New City",
      state: "NC",
      zip: "123456",
      country: "Country",
    };

    const res = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", [`token=${token}`])
      .send(newAddress);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("address");
    expect(res.body.address).toMatchObject({
      street: "New St",
      city: "New City",
      state: "NC",
      zip: "123456",
      country: "Country",
    });
  });

  it("returns 400 for invalid zip", async () => {
    const user = await new User({
      username: "invalidaddressuser",
      email: "invalidaddress@example.com",
      password: "irrelevant",
      fullName: { firstName: "Invalid", lastName: "Address" },
      addresses: [],
    }).save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const invalidAddress = {
      street: "Bad St",
      city: "Bad City",
      state: "BC",
      zip: 5454,
      country: "Country",
    };

    const res = await request(app)
      .post("/api/auth/users/me/addresses")
      .set("Cookie", [`token=${token}`])
      .send(invalidAddress);

    expect(res.status).toBe(400);
  });

  it("returns 401 if not authenticated", async () => {
    const newAddress = {
      street: "New St",
      city: "New City",
      state: "NC",
      zip: "123456",
      country: "Country",
      phone: "9876543210",
      pincode: "123456",
    };
    const res = await request(app)
      .post("/api/auth/users/me/addresses")
      .send(newAddress);
    expect(res.status).toBe(401);
  });
});





describe("DELETE /api/auth/users/me/addresses/:addressId", () => {

  it("removes an address for authenticated user by addressId", async () => {

    const user = await new User({
      username: "deleteaddressuser",
      email: "deleteaddress@example.com",
      password: "irrelevant",
      fullName: { firstName: "Delete", lastName: "Address" },
      addresses: [
        { street: "Del St", city: "Del City", state: "DC", zip: "654321", country: "Country" }
      ]
    }).save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const addressId = user.addresses[0]._id;

    const res = await request(app)
      .delete(`/api/auth/users/me/addresses/${addressId}`)
      .set("Cookie", [`token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.addresses).toHaveLength(0);
  });


  it("returns 404 if address not found", async () => {

    const user = await new User({
      username: "missingdeleteuser",
      email: "missingdelete@example.com",
      password: "irrelevant",
      fullName: { firstName: "Missing", lastName: "Delete" },
      addresses: []
    }).save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/auth/users/me/addresses/${fakeId}`)
      .set("Cookie", [`token=${token}`]);

    expect(res.status).toBe(404);
  });


  it("returns 401 if not authenticated", async () => {

    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/auth/users/me/addresses/${fakeId}`);

    expect(res.status).toBe(401);
  });

});

