import yahooFinance from "yahoo-finance2";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { symbols } = req.query;

  if (!symbols) {
    return res.status(400).json({ error: "Stock symbols are required" });
  }

  const stockSymbols = symbols.split(",").map((symbol) => symbol.trim());

  try {
    console.log("Requesting recommendations for", stockSymbols);
    const recommendations = await yahooFinance.recommendationsBySymbol(
      stockSymbols
    );
    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({
      error: "Failed to fetch recommendations",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
