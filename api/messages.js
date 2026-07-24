const dns = require('dns');
// Override DNS resolution to use Google Public DNS (bypasses local SRV lookup blocks)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'purrfect_gift';

// Reuse the client across invocations on the same warm serverless instance.
let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in the environment.');
  }
  const client = cachedClient || new MongoClient(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 8000,
  });
  if (!cachedClient) {
    await client.connect();
    cachedClient = client;
  }
  cachedDb = client.db(dbName);
  return cachedDb;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const db = await getDb();
    const collection = db.collection('notes');

    if (req.method === 'GET') {
      const notes = await collection
        .find({}, { projection: { name: 1, message: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      res.status(200).json({ notes });
      return;
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
      const name = (body && body.name ? String(body.name) : 'Anon').trim().slice(0, 60);
      const message = (body && body.message ? String(body.message) : '').trim().slice(0, 500);

      if (!message) {
        res.status(400).json({ error: 'A message is required.' });
        return;
      }

      const doc = {
        name: name || 'Anon',
        message,
        createdAt: new Date(),
      };

      const result = await collection.insertOne(doc);

      res.status(201).json({
        note: { _id: result.insertedId, ...doc },
      });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API /messages error:', err);
    res.status(500).json({ error: 'Something went wrong reaching the database.' });
  }
};