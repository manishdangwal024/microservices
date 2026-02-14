const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const User = require('../../src/models/user.model');

describe('POST /api/auth/register', () => {
  it('creates a user and returns 201', async () => {
    const payload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      fullName: { firstName: 'Test', lastName: 'User' }
    };

    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.username).toBe('testuser');

    const user = await User.findOne({ username: 'testuser' });
    expect(user).not.toBeNull();
    expect(user.email).toBe('test@example.com');
  });

  it('returns 409 when user already exists', async () => {
    const payload = {
      username: 'dupuser',
      email: 'dup@example.com',
      password: 'Password123!',
      fullName: { firstName: 'Dup', lastName: 'User' }
    };

    // create user first
    await new User({ username: 'dupuser', email: 'dup@example.com', password: 'hashed', fullName: { firstName: 'Dup', lastName: 'User' } }).save();

    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(409);
  });

  it('returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'incomplete' });
    expect(res.status).toBe(400);
  });
});
