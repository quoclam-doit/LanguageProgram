import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../server';

let mongoServer: MongoMemoryServer;
let authCookie: string;
let otherUserCookie: string;

const VALID_CSV = `term,meaning,partOfSpeech
Diligent,Chăm chỉ cần cù,adj
Ambitious,Có tham vọng,adj
`;

// Distinct words from VALID_CSV so this file's lookups can never hit a cache
// entry left behind by another test in this same DB (ticket 02's tier-1 cache).
const UNCACHED_WORDS_CSV = `term,meaning,partOfSpeech
Zorbaflex,Từ giả để test cache miss,n
Quintorable,Từ giả khác để test cache miss,n
`;

const CSV_WITH_ONE_SKIPPED_ROW = `term,meaning,partOfSpeech
Flimsworth,Từ giả hợp lệ,n
Brokenrow,,adj
Plendarious,Từ giả hợp lệ khác,n
`;

function stubFetchWithPhonetic() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          phonetics: [{ text: '/fake-ipa/', audio: 'https://example.com/audio-us.mp3' }],
        },
      ],
    })
  );
}

function stubFetchAlwaysFails() {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('dictionary API down')));
}

async function createDeckAndImport(cookie: string, csv: string) {
  const deckRes = await request(app)
    .post('/api/decks')
    .set('Cookie', [cookie])
    .send({ title: `Worker Test Deck ${Date.now()}-${Math.random()}` });
  const deckId = deckRes.body.data._id;

  const importRes = await request(app)
    .post(`/api/decks/${deckId}/import-csv`)
    .set('Cookie', [cookie])
    .attach('file', Buffer.from(csv), 'words.csv');

  return { deckId, jobId: importRes.body.data.jobId as string };
}

async function pollJobUntilCompleted(deckId: string, jobId: string, cookie: string, maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await request(app)
      .get(`/api/decks/${deckId}/import-jobs/${jobId}`)
      .set('Cookie', [cookie]);
    if (res.body?.data?.status === 'completed') {
      return res.body.data;
    }
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error('Import job did not reach completed status in time');
}

describe('Phase 3 Ticket 04: background enrichment worker + job progress', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const res = await request(app).post('/api/auth/register').send({
      email: 'workeruser@example.com',
      password: 'password123',
      name: 'Worker Tester',
    });
    authCookie = res.headers['set-cookie'][0];

    const otherRes = await request(app).post('/api/auth/register').send({
      email: 'otherworkeruser@example.com',
      password: 'password123',
      name: 'Other Worker Tester',
    });
    otherUserCookie = otherRes.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('1. worker enriches cards with IPA/audio in the background until the job completes', async () => {
    stubFetchWithPhonetic();
    const { deckId, jobId } = await createDeckAndImport(authCookie, VALID_CSV);

    const finalJob = await pollJobUntilCompleted(deckId, jobId, authCookie);
    expect(finalJob.status).toBe('completed');
    expect(finalJob.processedRows).toBe(finalJob.totalRows);
    expect(finalJob.totalRows).toBe(2);

    const cardsRes = await request(app)
      .get(`/api/cards/deck/${deckId}`)
      .set('Cookie', [authCookie]);
    expect(cardsRes.body.data.length).toBe(2);
    for (const card of cardsRes.body.data) {
      expect(card.ipa?.us).toBe('/fake-ipa/');
      expect(card.audioUrl).toBe('https://example.com/audio-us.mp3');
    }
  });

  it('2. GET job status returns 404 when the job does not belong to the requesting user', async () => {
    stubFetchWithPhonetic();
    const { deckId, jobId } = await createDeckAndImport(authCookie, VALID_CSV);

    const res = await request(app)
      .get(`/api/decks/${deckId}/import-jobs/${jobId}`)
      .set('Cookie', [otherUserCookie]);

    expect(res.status).toBe(404);
  });

  it('3. a dictionary lookup failure for one card does not fail the whole job', async () => {
    stubFetchAlwaysFails();
    const { deckId, jobId } = await createDeckAndImport(authCookie, UNCACHED_WORDS_CSV);

    const finalJob = await pollJobUntilCompleted(deckId, jobId, authCookie);
    expect(finalJob.status).toBe('completed');
    expect(finalJob.processedRows).toBe(finalJob.totalRows);

    const cardsRes = await request(app)
      .get(`/api/cards/deck/${deckId}`)
      .set('Cookie', [authCookie]);
    expect(cardsRes.body.data.length).toBe(2);
    for (const card of cardsRes.body.data) {
      expect(card.ipa?.us).toBeFalsy();
    }
  });

  it('4. processedRows reaches totalRows exactly even when a CSV row was skipped at import time', async () => {
    stubFetchWithPhonetic();
    const { deckId, jobId } = await createDeckAndImport(authCookie, CSV_WITH_ONE_SKIPPED_ROW);

    const finalJob = await pollJobUntilCompleted(deckId, jobId, authCookie);
    expect(finalJob.status).toBe('completed');
    expect(finalJob.totalRows).toBe(3);
    expect(finalJob.processedRows).toBe(3);
  });
});
