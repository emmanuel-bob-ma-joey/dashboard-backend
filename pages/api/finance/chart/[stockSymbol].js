import yahooFinance from "yahoo-finance2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function getOneYearAgoDate() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return oneYearAgo.toISOString().split("T")[0];
}

async function getHistoricalData(stockSymbol, queryOptions) {
  console.log(
    "Requesting historical data for",
    stockSymbol,
    "with options:",
    queryOptions
  );
  return await yahooFinance.historical(stockSymbol, queryOptions);
}

function handleError(res, error) {
  console.error("Error fetching historical data:", error);
  console.error("Error details:", JSON.stringify(error, null, 2));
  res.status(error.status || 500).json({
    error: "Failed to fetch historical data",
    details: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { stockSymbol } = req.query;

  if (!stockSymbol) {
    res.status(400).json({ error: "Stock symbol is required" });
    return;
  }

  const queryOptions = {
    period1: getOneYearAgoDate(),
    period2: new Date().toISOString().split("T")[0], // Today
    interval: "1d", // Daily intervals
  };

  try {
    const result = await getHistoricalData(stockSymbol, queryOptions);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
}
