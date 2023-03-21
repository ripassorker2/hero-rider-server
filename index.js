const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gvjclco.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   serverApi: ServerApiVersion.v1,
});

async function run() {
   try {
      const usersCollection = client.db("practiceDB").collection("users");
      const coursesCollection = client.db("practiceDB").collection("courses");

      // <<-------------Save user and get  JWT------------->>

      app.put("/user/:email", async (req, res) => {
         const email = req.params.email;
         const user = req.body;
         const filter = { email: email };
         const options = { upsert: true };
         const updateDoc = {
            $set: user,
         };
         const result = await usersCollection.updateOne(
            filter,
            updateDoc,
            options
         );
         const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "7d",
         });
         res.send({ result, token });
      });

      // <<------------- get single user ------------->>
      app.get("/users/:email", async (req, res) => {
         const email = req.params.email;
         const filter = { email: email };
         const result = await usersCollection.findOne(filter);
         res.send(result);
      });

      // <<------------- get  user  role------------->>
      app.get("/role/:email", async (req, res) => {
         const email = req.params.email;
         const filter = { email: email };
         const result = await usersCollection.findOne(filter);
         res.send({ role: result.role });
      });

      app.get("/users", async (req, res) => {
         const result = await usersCollection.find({}).toArray();
         res.send(result);
      });

      // <<------------- get courses ------------->>
      app.get("/courses", async (req, res) => {
         const result = await coursesCollection.find({}).toArray();
         res.send(result);
      });

      // <<------------- get course by id --------------->>
      app.get("/course/:id", async (req, res) => {
         const filter = { _id: new ObjectId(req.params.id) };
         const result = await coursesCollection.findOne(filter);
         res.send(result);
      });
   } finally {
   }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
   res.send("Server is running... in session");
});

app.listen(port, () => {
   console.log(`Server is running...on ${port}`);
});
