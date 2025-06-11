const request = require('supertest');
const app = require('../app');
const SessionService = require('../services/SessionService');

describe('Chatbot API', () => {
  let testSessionId;

  beforeAll(() => {
    testSessionId = 'test-' + Math.random().toString(36).substr(2, 9);
  });

  afterEach(() => {
    SessionService.clearSession(testSessionId);
  });

  test('Complete complaint flow', async () => {
    // Step 1: Initial message
    const res1 = await request(app)
      .post('/api/chatbot/chat')
      .send({ sessionId: testSessionId, message: 'Potholes on Main Road' });
    
    expect(res1.body.reply).toContain('📍 Please provide location');
    expect(res1.body.nextStep).toBe('ASK_LOCATION');

    // Step 2: Location
    const res2 = await request(app)
      .post('/api/chatbot/chat')
      .send({ sessionId: testSessionId, message: 'Sector 14' });
    
    expect(res2.body.reply).toContain('📝 Select category');
    expect(res2.body.nextStep).toBe('ASK_CATEGORY');

    // Step 3: Category
    const res3 = await request(app)
      .post('/api/chatbot/chat')
      .send({ sessionId: testSessionId, message: '1' });
    
    expect(res3.body.reply).toContain('COMPLAINT SUMMARY');
    expect(res3.body.nextStep).toBe('CONFIRM_SUBMIT');

    // Step 4: Confirmation
    const res4 = await request(app)
      .post('/api/chatbot/chat')
      .send({ sessionId: testSessionId, message: 'yes' });
    
    expect(res4.body.reply).toContain('✅ Complaint registered');
    expect(res4.body.nextStep).toBe('COMPLETE');
  });
});