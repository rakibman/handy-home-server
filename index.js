const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = 3000;

app.use(cors());
app.use(express.json());

// home listion
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.lvwoqtf.mongodb.net/?appName=Cluster0`;

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
    await client.connect();

    const db = client.db("handy-home");
    const serviceCollection = db.collection("services");
    const bookingCollection = db.collection("bookings");

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    // service add func
    app.post("/services", async (req, res) => {
      const data = req.body;
      const result = await serviceCollection.insertOne(data);
      res.send(result);
    });
    // services get func
    app.get("/services", async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result);
    });
    // my services get func
    app.get("/my-services", async (req, res) => {
      const email = req.query.email;
      const result = await serviceCollection
        .find({ provider_email: email })
        .toArray();
      res.send(result);
    });
    // banner services get func
    app.get("/banner-services", async (req, res) => {
      const result = await serviceCollection
        .find()
        .sort({ created_at: 1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
    // singel data find for detals page
    app.get("/services/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await serviceCollection.findOne({ _id: objectId });

      res.send(result);
    });
    // services delete function
    app.delete("/services/:id", async (req, res) => {
      const { id } = req.params;
      const result = await serviceCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });
    // service update func
    app.put("/services/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const update = {
        $set: data,
      };

      const result = await serviceCollection.updateOne(filter, update);

      res.send({
        success: true,
        result,
      });
    });
    // booking add func
    app.post("/my-bookings", async (req, res) => {
      const data = req.body;
      const result = await bookingCollection.insertOne(data);
      res.send(result);
    });
    // booking get func
    app.get("/my-bookings", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });
    // booking delete func
    app.delete("/my-bookings/:id", async (req, res) => {
      const { id } = req.params;
      const result = await bookingCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });
    // sort by price get func
    app.get("/sort-services", async (req, res) => {
      const minPrice = Number(req.query.minPrice);
      const maxPrice = Number(req.query.maxPrice);
      console.log({ minPrice, maxPrice });
      const result = await serviceCollection
        .find({ price: { $gte: minPrice, $lte: maxPrice } })
        .toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
