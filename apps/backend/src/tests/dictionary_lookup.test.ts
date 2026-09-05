import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../server';

let mongoServer: MongoMemoryServer;
let authCookie: string;

describe('Phase 3 Ticket 02: Dictionary phonetic lookup (2-tier)', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const res = await request(app).post('/api/auth/register').send({
      email: 'dictuser@example.com',
      password: 'password123',
      name: 'Dictionary Tester',
    });
    authCookie = res.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('1. GET /api/dictionary/lookup - requires authentication (401 without cookie)', async () => {
    const res = await request(app).get('/api/dictionary/lookup?word=resilience');
    expect(res.status).toBe(401);
  });

  it('2. GET /api/dictionary/lookup - calls Free Dictionary API and returns IPA/audio when word not cached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            word: 'resilience',
            phonetics: [
              { text: '/rɪˈzɪliəns/', audio: 'https://example.com/resilience-us.mp3' },
            ],
          },
        ],
      })
    );

    const res = await request(app)
      .get('/api/dictionary/lookup?word=Resilience')
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ipa.us).toBe('/rɪˈzɪliəns/');
    expect(res.body.data.audioUrl).toBe('https://example.com/resilience-us.mp3');
  });

  it('3. GET /api/dictionary/lookup - uses cache on repeat lookup (case/whitespace insensitive), does not call Free Dictionary API again', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(app)
      .get('/api/dictionary/lookup?word=  resilience  ')
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(200);
    expect(res.body.data.ipa.us).toBe('/rɪˈzɪliəns/');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('4. GET /api/dictionary/lookup - returns empty ipa/audio (still 200) when Free Dictionary API returns 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) })
    );

    const res = await request(app)
      .get('/api/dictionary/lookup?word=zzzznotarealword')
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ipa).toEqual({});
    expect(res.body.data.audioUrl).toBeFalsy();
  });

  it('5. GET /api/dictionary/lookup - returns empty ipa/audio (still 200) when Free Dictionary API throws a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const res = await request(app)
      .get('/api/dictionary/lookup?word=anothernotarealword')
      .set('Cookie', [authCookie]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ipa).toEqual({});
  });
});
