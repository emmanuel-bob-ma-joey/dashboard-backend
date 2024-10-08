import dbo from "../../db/conn.js";

export default async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    await dbo.connectToServer();
    const dbConnect = dbo.getDb();

    switch (req.method) {
      case "GET":
        // Handle GET request
        const userid = req.query.user;
        console.log("request query is", req.query);
        console.log("userid is", userid);
        dbConnect
          .collection("portfolio")
          .find({ user: userid })
          .toArray((err, result) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.status(200).json(result);
          });
        break;

      case "POST":
        // Handle POST request
        const myobj = {
          StockSymbol: req.body.stockSymbol,
          companyName: req.body.companyName,
          shares: req.body.shares,
          bookValue: req.body.bookValue,
          user: req.body.uid,
          buyPrice: req.body.buyPrice,
          sellPrice: req.body.sellPrice,
          buyDays: req.body.buyDays,
          sellDays: req.body.sellDays,
        };

        const existingRecord = await dbConnect.collection("portfolio").findOne({
          user: req.body.uid,
          StockSymbol: req.body.stockSymbol,
        });
        if (existingRecord) {
          return res.status(409).json({ message: "Record already exists" });
        }
        dbConnect.collection("portfolio").insertOne(myobj, (err, result) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json(result);
        });
        break;

      case "DELETE":
        // Handle DELETE request
        const myquery = {
          StockSymbol: req.body.StockSymbol,
          user: req.body.uid,
        };
        dbConnect.collection("portfolio").deleteOne(myquery, (err, result) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          if (result.deletedCount === 0) {
            res.status(404).json({ message: "Document not found" });
          } else {
            res.status(200).json({ message: "Document deleted" });
          }
        });
        break;
      case "OPTIONS":
        res.status(200).end();

      default:
        // Method not allowed
        res.setHeader("Allow", ["GET", "POST", "DELETE", "OPTIONS"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error("Database connection error", err);
    res.status(500).json({ error: "Failed to connect to the database" });
  }
}
