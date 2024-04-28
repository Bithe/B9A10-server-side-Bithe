//SERVER SETUP

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

//CONFIG
const app = express();
const port = process.env.PORT || 5000;

//MIDDLEWARE
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfawfp8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // DB CREATE
    const craftCollection = client.db("artCraftDB").collection("crafts");

    // POST THE ITEMS TO DB FROM ADD CRAFT PAGE
    app.post("/crafts/", async (req, res) => {
      console.log(req.body);
      // data coming from client site is req
      // data going server to client is res
      // STORE THE DATA TO DB
      const result = await craftCollection.insertOne(req.body);
      console.log(result);
      res.send(result);

      // GET THE DATA FROM
      app.get("/crafts", async (req, res) => {
        console.log(req.params.email);

        const cursor = craftCollection.find(); 
        const result = await cursor.toArray();
        // const result = await craftCollection.find({ email: req.params.email }).toArray();
        res.send(result)
      })

  

    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//ROOT
app.get("/", (req, res) => {
  res.send("Crafts server is running");
});

app.listen(port, () => {
  console.log(`Crafts server is running on port: ${port}`);
});