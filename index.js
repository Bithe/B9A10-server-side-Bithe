//SERVER SETUP

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    // await client.connect();

    // DB CREATE
    const craftCollection = client.db("artCraftDB").collection("crafts");
    const subCategoryCollection = client
      .db("artCraftDB")
      .collection("subcategory");

    // POST THE ITEMS TO DB FROM ADD CRAFT PAGE
    app.post("/crafts", async (req, res) => {
      console.log(req.body);
      // data coming from client site is req
      // data going server to client is res
      // STORE THE DATA TO DB
      const result = await craftCollection.insertOne(req.body);
      console.log(result);
      res.send(result);
    });

    // GET THE DATA FROM
    app.get("/crafts", async (req, res) => {
      console.log(req.params.email);

      const cursor = craftCollection.find();
      const result = await cursor.toArray();
      // const result = await craftCollection.find({ email: req.params.email }).toArray();
      res.send(result);
    });

    // GET THE DATA AS PER USER
    app.get("/crafts/:email", async (req, res) => {
      console.log(req.params.email);
      const cursor = craftCollection.find({ user_email: req.params.email });
      const result = await cursor.toArray();
      res.send(result);
    });

    // TO UPDATE GET SINGLE DATA FROM API
    app.get("/craft/:id", async (req, res) => {
      const id = req.params.id;
      console.log("updated id:", id);
      const query = { _id: new ObjectId(id) };

      console.log("updated qu:", query);
      const result = await craftCollection.findOne({ _id: new ObjectId(id) });
      console.log("update data:", result);

      res.send(result);
    });

    // UPDATE TO SERVER
    app.put("/craft/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCraft = req.body;

      const newUpdatedCraft = {
        $set: {
          item_name: updatedCraft.item_name,
          subcategory_Name: updatedCraft.subcategory_Name,
          photo: updatedCraft.photo,
          rating: updatedCraft.rating,
          processing_time: updatedCraft.processing_time,
          stockStatus: updatedCraft.stockStatus,
          price: updatedCraft.price,
          customization: updatedCraft.customization,
          short_description: updatedCraft.short_description,
        },
      };
      const result = await craftCollection.updateOne(
        filter,
        newUpdatedCraft,
        options
      );
      res.send(result);
    });

    // DELETE DATA
    app.delete("/crafts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await craftCollection.deleteOne(query);
      res.send(result);
    });

    // GET THE SUBCATEGORY DATA FROM SUBCATEGORY COLLECTION
    app.get("/subcategory", async (req, res) => {
      console.log(req.params.email);
      const cursor = subCategoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET SPECIFIC SUBCATEGORY DATA
    app.get("/subcategory/:subcategoryName", async (req, res) => {
      try {
        const { subcategoryName } = req.params;
        const result = await craftCollection
          .find({ subcategory_Name: subcategoryName })
          .toArray();

        res.send(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
