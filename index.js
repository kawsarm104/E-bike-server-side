const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
var cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

//middleware 
app.use(cors());
app.use(express.json());

//mongodb connection

// const uri = process.env.MONGO_URI;
const uri = process.env.MONGO_CONNECTION

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("database connected successfully");
    const database = client.db("e-bike");

    /* services collection */
    const usersCollection = database.collection("users");
    const productsCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviews");

    /*   ALL GET API 
            /products

      */

    //   receiving user info
    app.post("/users", async (req, res) => {
      const user = { ...req.body, role: "normaluser" };
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    // checking if the user already in database or not if not will save it else ignore
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      // const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc
        // options
      );
      // console.log(user,"success")
      res.json(result);
    });
    // make admin  change role
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result, "role success");
      res.json(result);
    });
    //  GETTING USER WHOOSE ROLE ADMIN
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    // get services api //
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();

      res.json(products);
    });
    // get orders api //
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const allOrder = await cursor.toArray();
      res.json(allOrder);
      // console.log("got order");
      // res.send("got order");
    });
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const allOrder = await cursor.toArray();
      res.json(allOrder);
      // console.log("got order");
      // res.send("got order");
    });
    // GET API FOR SINGLE SERVICE DETAILS
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;

      // console.log("id api hitted", id)
      const query = { _id: ObjectId(id) };
      const singleServiceDetails = await productsCollection.findOne(query);
      res.json(singleServiceDetails);
      // res.send("id paici ")
    });
    // GET API FOR MANAGE ALL ORDERS

    //   POST API FOR SAVING DATA IN DATABASE FROM CLIENT SITE
    app.post("/products", async (req, res) => {
      console.log("hit the post api ");
      const serviceItem = req.body;
      console.log(serviceItem);

      const result = await productsCollection.insertOne(serviceItem);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.json(result);
      //   res.send("post hitted")
    });
    // POST API FOR SHIPPING /ORDERS
    app.post("/orders", async (req, res) => {
      // const order = req.body;

      const order = { ...req.body, status: "pending" };

      // console.log("orders paiciiii",order);
      const result = await orderCollection.insertOne(order);

      res.json(result);
    });
    // REVIEWS
    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      console.log("reviews got hitted", reviews);
      const result = await reviewsCollection.insertOne(reviews);

      res.json(result);
    });
    /*


// DELETING ITEM 
    
    */

    // DELETE SINGLE orders(my orders)
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      // console.log("deleted the id", id)
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
    // DELETE SINGLE DOCS
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      // console.log("deleted the id", id)
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("E-Bike Server is Running!!!!!!!!!!! !!!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
