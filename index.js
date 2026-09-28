const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
require("dotenv").config();

// Adds headers: Access-Control-Allow-Origin: *
app.use(cors());
// express.json() = POST request-এর JSON data-কে Express-এর req.body-তে পড়ার উপযোগী করে।
app.use(express.json());

/* app.get("/", (req, res) => {
  res.send("Hello Mongodb");
}); */

// smartDealsNew
// xcCWQB9CcBigAxTU
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mrg0zof.mongodb.net/?appName=Cluster0`;

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

    /** Database Connection */

    const db = client.db("smartdbNew");
    const productsCollection = db.collection("products");
    const bidsCollection = db.collection("bids");

    /* ------------------
    * API Address Here
    ---------------------*/
    /** Post Product */
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    /** Get All Products */
    app.get("/", async (req, res) => {
      const cursor = productsCollection.find();
      const products = await cursor.toArray();
      res.send(products);
    });

    /** Product Delete */
    app.delete("/products/:id", async (req, res) => {
      const productId = req.params.id;
      const query = { _id: new ObjectId(productId) };
      const exist = await productsCollection.findOne(query);
      if (!exist) {
        return res.status(404).send({ message: "Product Not Found" });
      }
      const productDelete = await productsCollection.deleteOne(query);
      res.send(productDelete);
    });

    /** Products Update */
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      console.log(product);
      const query = { _id: new ObjectId(id) };
      const productFieldSet = {
        // $set: {
        //   title: product.title,
        //   price_min: product.price_min,
        //   price_max: product.price_max,
        //   email: product.email,
        //   category: product.category,
        //   created_at: product.created_at,
        //   image: product.image,
        //   status: product.status,
        //   location: product.location,
        //   seller_image: product.seller_image,
        //   seller_name: product.seller_name,
        //   condition: product.condition,
        //   usage: product.usage,
        //   description: product.description,
        //   seller_contact: product.seller_contact,
        //   expired_date: product.expired_date,
        // },
        $set: product,
      };
      const updatedProduct = await productsCollection.updateOne(
        query,
        productFieldSet,
      );

      if (updatedProduct.modifiedCount === 0) {
        return res.send({ message: "Nothing to Change" });
      }
      res.send(updatedProduct);
    });

    /** Get Single Product (Front-End View Details) */
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await productsCollection.findOne(query);
      if (!product) {
        return res.status(404).send({ message: "Product Not Found" });
      }
      res.send(product);
    });

    /**Add Bid */
    app.post("/bids", async (req, res) => {
      const bid = req.body;
      const productId = bid.productId;
      const buyerEmail = bid.buyerEmail;
      const query = { productId, buyerEmail };
      const productExist = await bidsCollection.findOne(query);
      if (productExist) {
        return res
          .status(409)
          .send({ message: "You have already bid this product" });
      }
      const productBid = await bidsCollection.insertOne(bid);
      res.send(productBid);
    });

    /**Product Bids */
    app.get("/productBids", async (req, res) => {
      const productId = req.query.productId;
      const query = { productId };
      const cursor = bidsCollection.find(query);
      const productBids = await cursor.toArray();
      res.send(productBids);
    });

    /** All Bids */
    app.get("/allBids", async (req, res) => {
      const cursor = bidsCollection.find();
      const allBids = await cursor.toArray();
      res.send(allBids);
    });

    /** My Bids */
    app.get("/myBids", async (req, res) => {
      const buyerEmail = req.query.buyerEmail;
      const query = { buyerEmail };
      const cursor = bidsCollection.find(query);
      const myBids = await cursor.toArray();
      res.send(myBids);
    });

    /** Delete Bids */
    app.delete("/bidDelete/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const product = await bidsCollection.findOne(query);
      if (!product) {
        return res.status(404).send({ message: "Product not Found" });
      }
      const bidDelete = await bidsCollection.deleteOne(query);
      res.send(bidDelete);
    });

    /** Get single Bid For Update */
    app.get("/bid/:bidId", async (req, res) => {
      const bidId = req.params.bidId;
      const query = { _id: new ObjectId(bidId) };
      const bid = await bidsCollection.findOne(query);
      res.send(bid);
    });

    /** Update User Bid */
    app.patch("/updateBid/:bidId", async (req, res) => {
      // const bidId = req.params.bidId;
      const bidId = req.params.bidId;
      const bid = req.body;
      const bidPrice = bid.bidPrice;
      const buyerContact = bid.buyerContact;
      const query = { _id: new ObjectId(bidId) };
      const updateBid = {
        $set: {
          bidPrice,
          buyerContact,
        },
      };
      const update = await bidsCollection.updateOne(query, updateBid);
      if (update.matchedCount === 0) {
        return res.status(404).send({ message: "Bid not found" });
      }
      res.send(update);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (error) {
    console.log(error);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
