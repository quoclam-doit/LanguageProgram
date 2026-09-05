import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../server';

let mongoServer: MongoMemoryServer;
let authCookie: string;
let otherUserCookie: string;
let deckId: string;

const VALID_CSV = `term,meaning,partOfSpeech,exampleEn,exampleVi
Diligent,Chăm chỉ cần cù,adj,She is a diligent student.,Cô ấy là một học sinh chăm chỉ.
Ambitious,Có tham vọng,adj,,
`;

const MISSING_COLUMN_CSV = `term,meaning
Diligent,Chăm chỉ cần cù
`;

const PARTIAL_BAD_ROW_CSV = `term,meaning,partOfSpeech
Diligent,Chăm chỉ cần cù,adj
Broken,,adj
Ambitious,Có tham vọng,adj
`;

describe('Phase 3 Ticket 03: CSV import creates cards immediately', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const res = await request(app).post('/api/auth/register').send({
      email: 'importuser@example.com',
      password: 'password123',
      name: 'Import Tester',
    });
    authCookie = res.headers['set-cookie'][0];

    const otherRes = await request(app).post('/api/auth/register').send({
      email: 'otherimportuser@example.com',
      password: 'password123',
      name: 'Other User',
    });
    otherUserCookie = otherRes.headers['set-cookie'][0];

    const deckRes = await request(app)
      .post('/api/decks')
      .set('Cookie', [authCookie])
      .send({ title: 'Import Test Deck' });
    deckId = deckRes.body.data._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('1. rejects import when deck does not belong to the requesting user', async () => {
    const res = await request(app)
      .post(`/api/decks/${deckId}/import-csv`)
      .set('Cookie', [otherUserCookie])
      .attach('file', Buffer.from(VALID_CSV), 'words.csv');

    expect([403, 404]).toContain(res.status);
  });

  it('2. rejects CSV missing a required column, creates no cards', async () => {
    const res = await request(app)
      .post(`/api/decks/${deckId}/import-csv`)
      .set('Cookie', [authCookie])
      .attach('file', Buffer.from(MISSING_COLUMN_CSV), 'words.csv');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    const cardsRes = await request(app)
      .get(`/api/cards/deck/${deckId}`)
      .set('Cookie', [authCookie]);
    expect(cardsRes.body.data.length).toBe(0);
  });

  it('3. valid CSV creates cards immediately and returns a pending job without waiting', async () => {
    const res = await request(app)
      .post(`/api/decks/${deckId}/import-csv`)
      .set('Cookie', [authCookie])
      .attach('file', Buffer.from(VALID_CSV), 'words.csv');

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.jobId).toBeDefined();
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.totalRows).toBe(2);
    expect(res.body.data.processedRows).toBe(0);
    expect(res.body.data.cardsCreated).toBe(2);

    const cardsRes = await request(app)
      .get(`/api/cards/deck/${deckId}`)
      .set('Cookie', [authCookie]);
    expect(cardsRes.status).toBe(200);
    expect(cardsRes.body.data.length).toBe(2);
    const terms = cardsRes.body.data.map((c: any) => c.term);
    expect(terms).toContain('Diligent');
    expect(terms).toContain('Ambitious');

    const deckRes = await request(app)
      .get(`/api/decks/${deckId}`)
      .set('Cookie', [authCookie]);
    expect(deckRes.body.data.cardCount).toBe(2);
  });

  it('4. a row with a blank required cell is skipped, valid rows in the same file still get created (no 500)', async () => {
    const partialDeckRes = await request(app)
      .post('/api/decks')
      .set('Cookie', [authCookie])
      .send({ title: 'Partial Row Deck' });
    const partialDeckId = partialDeckRes.body.data._id;

    const res = await request(app)
      .post(`/api/decks/${partialDeckId}/import-csv`)
      .set('Cookie', [authCookie])
      .attach('file', Buffer.from(PARTIAL_BAD_ROW_CSV), 'words.csv');

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRows).toBe(3);
    expect(res.body.data.cardsCreated).toBe(2);

    const cardsRes = await request(app)
      .get(`/api/cards/deck/${partialDeckId}`)
      .set('Cookie', [authCookie]);
    expect(cardsRes.body.data.length).toBe(2);

    const deckRes = await request(app)
      .get(`/api/decks/${partialDeckId}`)
      .set('Cookie', [authCookie]);
    expect(deckRes.body.data.cardCount).toBe(2);
  });
});
