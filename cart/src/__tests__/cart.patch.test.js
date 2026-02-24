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

describe('PATCH /api/cart/items/:productId', () => {
  beforeEach(() => {
    saveMock.mockClear();
    MockCart.findOne.mockClear();
    process.env.token = 'test-secret';
  });

  test('updates quantity and returns recalculated totals', async () => {
    const existingCart = new MockCart({ user: '000000000000000000000001', items: [
      { productId: { toString: () => '507f1f77bcf86cd799439011' }, quantity: 1 }
    ] });
    MockCart.findOne.mockResolvedValue(existingCart);

    const app = require('../app');
    const token = jwt.sign({ _id: '000000000000000000000001', role: 'user' }, process.env.token);
    const res = await request(app)
      .patch('/api/cart/items/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)
      .send({ qty: 3 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cart');
    expect(res.body.cart.items[0].quantity).toBe(3);
    expect(res.body).toHaveProperty('totals');
    expect(typeof res.body.totals).toBe('object');
    expect(saveMock).toHaveBeenCalled();
  });

  test('removes item when qty <= 0 and returns recalculated totals', async () => {
    const existingCart = new MockCart({ user: '000000000000000000000001', items: [
      { productId: { toString: () => '507f1f77bcf86cd799439011' }, quantity: 2 }
    ] });
    MockCart.findOne.mockResolvedValue(existingCart);

    const app = require('../app');
    const token = jwt.sign({ _id: '000000000000000000000001', role: 'user' }, process.env.token);
    const res = await request(app)
      .patch('/api/cart/items/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)
      .send({ qty: 0 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cart');
    expect(Array.isArray(res.body.cart.items)).toBe(true);
    expect(res.body.cart.items.length).toBe(0);
    expect(res.body).toHaveProperty('totals');
    expect(typeof res.body.totals).toBe('object');
    expect(saveMock).toHaveBeenCalled();
  });
});
