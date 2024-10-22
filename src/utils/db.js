// utils/db.js
import { MongoClient } from 'mongodb';


// const MONGODB_URI = ('mongodb+srv://taskUser:FWQ7JAZMt0p07qFv@cluster0.5kgqkgx.mongodb.net/taskManagment?retryWrites=true&w=majority&appName=Cluster0');
// const MONGODB_DB = "taskManagment";
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}