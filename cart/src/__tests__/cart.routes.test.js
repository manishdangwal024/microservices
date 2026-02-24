const request = require('supertest');
const jwt = require('jsonwebtoken');

const saveMock = jest.fn().mockResolvedValue();
function MockCart(data) {
  this.user = data.user;
  this.items = data.items || [];
  this.save = saveMock;
}
MockCart.findOne = jest.fn();
jest.mock('../models/cart.model', () => MockCart);

describe('POST /api/cart/items', () => {
  beforeEach(() => {
    saveMock.mockClear();
    MockCart.findOne.mockClear();
    process.env.token = 'test-secret';
  });

  test('adds item to cart when no existing cart', async () => {
    MockCart.findOne.mockResolvedValue(null);
    const app = require('../app');
    const token = jwt.sign({ _id: '000000000000000000000001', role: 'user' }, process.env.token);
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: '507f1f77bcf86cd799439011', qty: 2 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Items add to cart');
    expect(saveMock).toHaveBeenCalled();
  });

  test('updates quantity when item already in existing cart', async () => {
    const existingCart = new MockCart({ user: '000000000000000000000001', items: [
      { productId: { toString: () => '507f1f77bcf86cd799439011' }, quantity: 1 }
    ] });
    MockCart.findOne.mockResolvedValue(existingCart);
    const app = require('../app');
    const token = jwt.sign({ _id: '000000000000000000000001', role: 'user' }, process.env.token);
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: '507f1f77bcf86cd799439011', qty: 2 });

    expect(res.status).toBe(200);
    expect(res.body.cart.items[0].quantity).toBe(3);
    expect(saveMock).toHaveBeenCalled();
  });

  test('returns 400 for invalid input (validation error)', async () => {
    MockCart.findOne.mockResolvedValue(null);
    const app = require('../app');
    const token = jwt.sign({ _id: '000000000000000000000001', role: 'user' }, process.env.token);
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 'invalid-id', qty: 0 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation error');
  });

  test('returns 401 when token is missing', async () => {
    MockCart.findOne.mockResolvedValue(null);
    const app = require('../app');
    const res = await request(app)
      .post('/api/cart/items')
      .send({ productId: '507f1f77bcf86cd799439011', qty: 1 });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', expect.stringContaining('Unauthorized'));
  });

  test('returns 403 for insufficient role', async () => {
    MockCart.findOne.mockResolvedValue(null);
    const app = require('../app');
    const token = jwt.sign({ _id: '000000000000000000000002', role: 'guest' }, process.env.token);
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: '507f1f77bcf86cd799439011', qty: 1 });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'forbidden:insufficient permission');
  });
});
