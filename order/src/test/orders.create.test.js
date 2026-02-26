const express = require('express');
const request = require('supertest');

// mocks must be set up before requiring the router/controller so requires pick them up
jest.mock('axios');
jest.mock('../model/order.model');

// mock auth middleware to inject a user and skip JWT verification
jest.mock('../middleware/auth.middleware', () => {
  return () => (req, res, next) => {
    req.user = { id: 'user-1', role: 'user' };
    next();
  };
});

// mock validation middleware to be a no-op
jest.mock('../middleware/validation.middleware', () => ({
  userAddressUserValidation: (req, res, next) => next(),
}));

const axios = require('axios');
const orderModel = require('../model/order.model');
const router = require('../routes/order.routes');

describe('POST /api/orders/ (createOrder controller)', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/orders', router);
    jest.clearAllMocks();
  });

  test('creates an order from cart items, validates stock, computes totals and returns 201 with order', async () => {
    // Arrange: mock cart service response
    axios.get.mockImplementation((url) => {
      if (url.includes('localhost:3002/api/cart')) {
        return Promise.resolve({
          data: {
            cart: {
              items: [
                { productId: 'p1', quantity: 2 },
                { productId: 'p2', quantity: 1 },
              ],
            },
          },
        });
      }

      if (url.includes('/api/products/p1')) {
        return Promise.resolve({
          data: {
            product: {
              _id: 'p1',
              title: 'Product 1',
              stock: 10,
              price: { amount: 100, currency: 'INR' },
            },
          },
        });
      }

      if (url.includes('/api/products/p2')) {
        return Promise.resolve({
          data: {
            product: {
              _id: 'p2',
              title: 'Product 2',
              stock: 5,
              price: { amount: 50, currency: 'INR' },
            },
          },
        });
      }

      return Promise.reject(new Error('unexpected url:' + url));
    });

    // Arrange: mock orderModel.create to return the saved order
    const expectedOrder = {
      _id: 'order-1',
      user: 'user-1',
      items: [
        { product: 'p1', quantity: 2, prices: { amount: 200, currency: 'INR' } },
        { product: 'p2', quantity: 1, prices: { amount: 50, currency: 'INR' } },
      ],
      status: 'PENDING',
      totalPrice: { amount: 250, currency: 'INR' },
      shippingAddress: {
        street: '123 Main St',
        city: 'Townsville',
        state: 'TS',
        zip: '12345',
        country: 'IN',
      },
    };

    orderModel.create.mockResolvedValue(expectedOrder);

    const body = {
      shippingAddress: expectedOrder.shippingAddress,
    };

    // Act
    const res = await request(app)
      .post('/api/orders/')
      .set('Authorization', 'Bearer faketoken')
      .send(body);

    // Assert
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('order');
    const order = res.body.order;

    expect(order.user).toBe(expectedOrder.user);
    expect(order.items).toHaveLength(2);
    expect(order.items[0]).toMatchObject({ product: 'p1', quantity: 2 });
    expect(order.items[0].prices).toMatchObject({ amount: 200, currency: 'INR' });
    expect(order.items[1]).toMatchObject({ product: 'p2', quantity: 1 });
    expect(order.items[1].prices).toMatchObject({ amount: 50, currency: 'INR' });
    expect(order.totalPrice).toMatchObject({ amount: 250, currency: 'INR' });
    expect(order.status).toBe('PENDING');
    expect(order.shippingAddress).toMatchObject(body.shippingAddress);

    // ensure axios was called for cart and two product lookups
    expect(axios.get).toHaveBeenCalled();
    const cartCall = axios.get.mock.calls.find((c) => c[0].includes('api/cart'));
    expect(cartCall).toBeDefined();
    expect(axios.get.mock.calls.filter((c) => c[0].includes('/api/products/'))).toHaveLength(2);

    // ensure orderModel.create was called with expected shape
    expect(orderModel.create).toHaveBeenCalledWith(expect.objectContaining({
      user: 'user-1',
      items: expect.any(Array),
      status: 'PENDING',
      totalPrice: { amount: 250, currency: 'INR' },
      shippingAddress: body.shippingAddress,
    }));
  });
});
