import yahooFinance from "yahoo-finance2";

export default async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "GET") {
    const { stockSymbol } = req.query; // Vercel automatically populates req.query with dynamic route parameters

    console.log("requesting quote for", stockSymbol);

    try {
      const result = await yahooFinance.quote(stockSymbol);
      res.json(result);
    } catch (error) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  } else {
    // If the request method is not GET, return a 405 Method Not Allowed.
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
