// const { MongoClient } = require("mongodb");
// const Db = process.env.MONGODB_URI;
// const client = new MongoClient(Db, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// var _db;

// module.exports = {
//   connectToServer: function (callback) {
//     client.connect(function (err, db) {
//       // Verify we got a good "db" object
//       if (db) {
//         _db = db.db("finance_dashboard");
//         console.log("Successfully connected to MongoDB.");
//       }
//       return callback(err);
//     });
//   },

//   getDb: function () {
//     return _db;
//   },
// };
// const { MongoClient } = require("mongodb");
import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
const Db = process.env.MONGODB_URI;
console.log(Db);
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// var _db;
let _db;

const database = {
  connectToServer: function () {
    return new Promise((resolve, reject) => {
      client.connect((err, db) => {
        if (err) {
          console.error("Failed to connect to MongoDB", err);
          reject(err);
        } else {
          _db = db.db("finance_dashboard");
          console.log("Successfully connected to MongoDB.");
          resolve();
        }
      });
    });
  },

  getDb: function () {
    return _db;
  },
};

export default database;
