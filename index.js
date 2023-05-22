const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a81ulqy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    // Connect the client to the server (optional starting in v4.7)

    const toyCollection = client.db('magicalToyland').collection('toys');

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/', (req, res) => {
      res.send('Magical ToyLand Is Running');
    });

    app.get('/toys', async (req, res) => {
      const email = req.query.email;
      let query = {};

      if (email) {
        query = { email };
      }

      const sort = req.query.sort;
      let sortOptions = {};

      if (sort) {
        const [field, order] = sort.split(":");
        sortOptions[field] = order === "1" ? 1 : -1;
      }

      const cursor = toyCollection.find(query).sort(sortOptions);
      const toys = await cursor.toArray();
      res.json(toys);
    });

    app.get('/toys/:id', async (req, res) => {
      const toyId = req.params.id;
      const objectId = new ObjectId(toyId);
      const toy = await toyCollection.findOne({ _id: objectId });
      res.json(toy);
    });

    app.post('/toys', async (req, res) => {
      const newToy = req.body;
      const result = await toyCollection.insertOne(newToy);
      res.json(result);
    });

    app.put('/toys/:id', async (req, res) => {
      const toyId = req.params.id;
      const objectId = new ObjectId(toyId);
      const updatedToy = req.body;
      const result = await toyCollection.updateOne(
        { _id: objectId },
        { $set: updatedToy }
      );
      res.json({ success: true });
    });

    app.delete('/toys/:id', async (req, res) => {
      const toyId = req.params.id;
      const objectId = new ObjectId(toyId);
      const result = await toyCollection.deleteOne({ _id: objectId });
      res.json(result);
    });

    // Sorting toys in ascending order based on price
    console.log('Before sorting - ascending');
    toyCollection.find({}).sort({ price: 1 }).toArray((err, result) => {
      if (err) {
        console.error('Error fetching toys (ascending):', err);
        return;
      }

      console.log('Toys sorted in ascending order based on price:', result);
    });

    // Sorting toys in descending order based on price
    console.log('Before sorting - descending');
    toyCollection.find({}).sort({ price: -1 }).toArray((err, result) => {
      if (err) {
        console.error('Error fetching toys (descending):', err);
        return;
      }

      console.log('Toys sorted in descending order based on price:', result);
    });

    app.listen(port, () => {
      console.log(`Magical ToyLand Server Is Running On Port: ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);
