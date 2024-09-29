import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  const client = await MongoClient.connect(uri, options);
  const db = client.db("finance_dashboard");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { uid } = req.query;
  const { StockSymbol, shares, bookValue } = req.body;

  if (!uid || !StockSymbol || shares == null || bookValue == null) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const { db } = await connectToDatabase();

    // First, find the existing record
    const existingRecord = await db
      .collection("portfolio")
      .findOne({ userId: uid, StockSymbol: StockSymbol });

    let newBookValue;
    if (existingRecord) {
      if (shares > existingRecord.shares) {
        // Buying more shares
        const additionalShares = shares - existingRecord.shares;
        newBookValue = existingRecord.bookValue + additionalShares * bookValue;
      } else if (shares < existingRecord.shares) {
        // Selling shares
        const soldShares = existingRecord.shares - shares;
        const averageCost = existingRecord.bookValue / existingRecord.shares;
        newBookValue = existingRecord.bookValue - soldShares * averageCost;
      } else {
        // Same number of shares, update bookValue
        newBookValue = bookValue * shares;
      }
    } else {
      // New record
      newBookValue = bookValue * shares;
    }

    const result = await db.collection("portfolio").updateOne(
      { userId: uid, StockSymbol: StockSymbol },
      {
        $set: {
          shares: shares,
          bookValue: newBookValue,
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );

    if (result.matchedCount > 0) {
      res.status(200).json({
        message: "Portfolio record updated successfully",
        result,
        newBookValue,
      });
    } else {
      res.status(201).json({
        message: "New portfolio record created",
        result,
        newBookValue,
      });
    }
  } catch (error) {
    console.error("Error updating portfolio:", error);
    res
      .status(500)
      .json({ message: "Error updating portfolio", error: error.toString() });
  }
}
