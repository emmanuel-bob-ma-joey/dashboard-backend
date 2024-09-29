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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  let { db } = await connectToDatabase();

  switch (req.method) {
    case "OPTIONS":
      res.status(200).end();
      break;

    case "POST":
      const { user } = req.body;

      if (!user) {
        return res.status(400).json({ message: "Missing user" });
      }

      try {
        const result = await db.collection("users").insertOne({ user });
        res.status(201).json({ message: "User created successfully", result });
      } catch (error) {
        console.error("Error creating user:", error);
        res
          .status(500)
          .json({ message: "Error creating user", error: error.toString() });
      }
      break;

    case "DELETE":
      const { user: userIdToDelete } = req.query;

      if (!userIdToDelete) {
        return res
          .status(400)
          .json({ message: "Missing user id in query parameters" });
      }

      try {
        console.log("Attempting to delete user:", userIdToDelete);

        const deleteUserResult = await db
          .collection("users")
          .deleteOne({ user: userIdToDelete });
        console.log("Delete user result:", deleteUserResult);

        const deletePortfolioResult = await db
          .collection("portfolio")
          .deleteMany({ user: userIdToDelete });
        console.log("Delete portfolio result:", deletePortfolioResult);

        const deleteWatchlistResult = await db
          .collection("watchlist")
          .deleteMany({ user: userIdToDelete });
        console.log("Delete watchlist result:", deleteWatchlistResult);

        res.status(200).json({
          message: "User and associated data deleted successfully",
          userDeleted: deleteUserResult.deletedCount,
          portfolioItemsDeleted: deletePortfolioResult.deletedCount,
          watchlistItemsDeleted: deleteWatchlistResult.deletedCount,
        });
      } catch (error) {
        console.error("Error deleting user data:", error);
        res.status(500).json({
          error: "Failed to delete user data",
          details: error.toString(),
        });
      }
      break;

    default:
      res.status(405).json({ message: "Method Not Allowed" });
  }
}
