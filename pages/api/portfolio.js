import dbo from "../../db/conn.js";

export default async function (req, res) {
  const dbConnect = dbo.getDb("finance_dashboard");

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  switch (req.method) {
    case "GET":
      // Handle GET request
      dbConnect
        .collection("portfolio")
        .find({})
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
        shares: 0,
        bookValue: 0,
      };
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
      const myquery = { StockSymbol: req.body.StockSymbol };
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

    default:
      // Method not allowed
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
