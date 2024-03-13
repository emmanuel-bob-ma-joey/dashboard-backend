import dbo from "../../../db/conn.js";

export default async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // Ensure the method is POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { stockSymbol } = req.query; // Extracting the stockSymbol from the query parameters
  const dbConnect = dbo.getDb("finance_dashboard");

  const myquery = { StockSymbol: stockSymbol };
  const newvalues = {
    $inc: {
      shares: req.body.shares,
      bookValue: req.body.shares * req.body.bookValue,
    },
  };

  try {
    const updateResult = await dbConnect
      .collection("portfolio")
      .updateOne(myquery, newvalues);
    console.log("1 document updated");
    res.json(updateResult);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while updating the document." });
  }
}
