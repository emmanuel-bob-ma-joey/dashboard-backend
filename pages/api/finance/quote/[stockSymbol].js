import yahooFinance from "yahoo-finance2";

export default async function (req, res) {
  const { stockSymbol } = req.query; // Vercel automatically populates req.query with dynamic route parameters

  console.log("requesting quote for", stockSymbol);

  try {
    const result = await yahooFinance.quote(stockSymbol);
    res.json(result);
  } catch (error) {
    console.error("Error fetching quote:", error);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
}
