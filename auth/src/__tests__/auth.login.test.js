process.env.JWT_SECRET = 'testsecret';

const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');
const bcrypt = require('bcryptjs');

describe('POST /api/auth/login', () => {

  it('returns 200 and sets cookie on valid credentials (username)', async () => {

    const password = 'MyPass123!';
    const hashed = await bcrypt.hash(password, 10);

    await new User({
      username: 'loginuser',
      email: 'login@example.com',
      password: hashed,
      role: 'user',
      fullName: { firstName: 'Login', lastName: 'User' }
    }).save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'loginuser',
        password
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User logged in successfully');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('token=');
  });


  it('returns 200 and sets cookie on valid credentials (email)', async () => {

    const password = 'EmailPass123!';
    const hashed = await bcrypt.hash(password, 10);

    await new User({
      username: 'emailuser',
      email: 'emailuser@example.com',
      password: hashed,
      role: 'user',
      fullName: { firstName: 'Email', lastName: 'User' }
    }).save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'emailuser@example.com',
        password
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User logged in successfully');
    expect(res.headers['set-cookie'][0]).toContain('token=');
  });


  it('returns 401 for invalid password', async () => {

    const password = 'RightPass!';
    const hashed = await bcrypt.hash(password, 10);

    await new User({
      username: 'badpass',
      email: 'badpass@example.com',
      password: hashed,
      role: 'user',
      fullName: { firstName: 'Bad', lastName: 'Pass' }
    }).save();

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'badpass',
        password: 'WrongPass'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });


  it('returns 401 for unknown user', async () => {

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nouser',
        password: 'whatever'
      });

    expect(res.status).toBe(401);
  });


});
