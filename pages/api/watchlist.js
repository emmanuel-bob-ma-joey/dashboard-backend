import dbo from "../../db/conn.js";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  await dbo.connectToServer();
  const dbConnect = dbo.getDb();

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust as needed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  switch (req.method) {
    case "GET":
      // Handle GET request
      try {
        const userid = req.query.user;
        console.log("request query is", req.query);
        console.log("userid is", userid);
        const result = await dbConnect
          .collection("watchlist")
          .find({ user: userid })
          .toArray();
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case "POST":
      // Handle POST request
      const myobj = {
        StockSymbol: req.body.stockSymbol,
        companyName: req.body.companyName,
        user: req.body.uid,
      };
      try {
        const result = await dbConnect.collection("watchlist").insertOne(myobj);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case "DELETE":
      // Handle DELETE request
      const myquery = {
        stockSymbol: req.body.stockSymbol,
        user: req.body.user,
      }; // Assuming you're passing the document ID to delete
      try {
        const result = await dbConnect
          .collection("watchlist")
          .deleteOne(myquery);
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Document not found" });
        }
        res.status(200).json({ message: "Document deleted" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      // Method not allowed
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
