import dbo from "../../db/conn.js";

export default async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust as needed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const dbConnect = dbo.getDb("finance_dashboard");

  switch (req.method) {
    case "OPTIONS":
      res.status(200).end();
      break;
    case "POST":
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
    case "DELETE":
      const { uid: userIdToDelete } = req.query;

      try {
        // Delete user from users collection
        await dbConnect.collection("users").deleteOne({ uid: userIdToDelete });

        // Delete user's portfolio
        await dbConnect
          .collection("portfolio")
          .deleteMany({ user: userIdToDelete });

        // Delete user's watchlist
        await dbConnect
          .collection("watchlist")
          .deleteMany({ user: userIdToDelete });

        res
          .status(200)
          .json({ message: "User and associated data deleted successfully" });
      } catch (error) {
        console.error("Error deleting user data:", error);
        res.status(500).json({ error: "Failed to delete user data" });
      }
      break;
    default:
      res.status(405).json({ message: "Method Not Allowed" });
  }
}
