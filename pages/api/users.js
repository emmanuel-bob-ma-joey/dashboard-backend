import dbo from "../../db/conn.js";

export default async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust as needed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  switch (req.method) {
    case "OPTIONS":
      res.status(200).end();
      break;
    case "POST":
      const dbConnect = dbo.getDb("finance_dashboard");
      const { uid, email } = req.body;

      try {
        const result = await dbConnect
          .collection("users")
          .insertOne({ uid, email });
        res.status(201).json({ message: "User created successfully", result });
      } catch (error) {
        console.error("Error creating user:", error);
        res
          .status(500)
          .json({ message: "Error creating user", error: error.message });
      }
      break;
    default:
      res.status(405).json({ message: "Method Not Allowed" });
  }
}
