const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
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
    const db = client.db("ImportExport-db");
    const dataCollection = db.collection("data");
    const importCollection = db.collection("imports");

    // Get latest 6 products
    app.get("/latestProducts", async (req, res) => {
      const result = await dataCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // Get all products
    app.get("/data", async (req, res) => {
      const result = await dataCollection.find().toArray();
      res.send(result);
    });

    // Get single product details
    app.get("/data/:id", async (req, res) => {
      const { id } = req.params;
      const product = await dataCollection.findOne({ _id: id });
      res.send(product);
    });

    // Import product
    app.post("/import/:userId", async (req, res) => {
      const { userId } = req.params;
      const { productId, importQuantity } = req.body;

      const product = await dataCollection.findOne({ _id: productId });
      if (!product)
        return res.status(404).send({ message: "Product not found" });

      if (importQuantity > product.quantity)
        return res.status(400).send({
          message: "Import quantity exceeds available quantity",
        });

      // Update product quantity
      await dataCollection.updateOne(
        { _id: productId },
        { $inc: { quantity: -importQuantity } }
      );

      // Save import record
      const importData = {
        productId,
        userId,
        name: product.name,
        image: product.image,
        price: product.price,
        rating: product.rating,
        originCountry: product.originCountry,
        importedQuantity: importQuantity,
        createdAt: new Date(),
      };

      const result = await importCollection.insertOne(importData);
      res.send({ success: true, imported: result });
    });

    // Get all imports of a user
    app.get("/my-imports/:userId", async (req, res) => {
      const { userId } = req.params;
      const result = await importCollection.find({ userId }).toArray();
      res.send(result);
    });

    // Delete an import
    app.delete("/my-imports/:id", async (req, res) => {
      const { id } = req.params;
      const result = await importCollection.deleteOne({
        _id: id,
      });

      // Add Export/Product
      // app.post("/add-product", async (req, res) => {
      //   try {
      //     const {
      //       name,
      //       image,
      //       price,
      //       originCountry,
      //       rating,
      //       quantity,
      //       userId,
      //     } = req.body;

      //     // Validation
      //     if (
      //       !name ||
      //       !image ||
      //       !price ||
      //       !originCountry ||
      //       !rating ||
      //       !quantity
      //     ) {
      //       return res
      //         .status(400)
      //         .send({ success: false, message: "All fields required" });
      //     }

      //     const newProduct = {
      //       _id: new ObjectId().toString(), // unique ID as string
      //       userId,
      //       name,
      //       image,
      //       price,
      //       originCountry,
      //       rating,
      //       quantity,
      //       importedQuantity: 0,
      //       createdAt: new Date(),
      //     };

      //     const result = await dataCollection.insertOne(newProduct);
      //     res.send({ success: true, data: result });
      //   } catch (error) {
      //     console.error(error);
      //     res
      //       .status(500)
      //       .send({ success: false, message: "Failed to add product", error });
      //   }
      // });

      // Add Export/Product route
      app.post("/add-product", async (req, res) => {
        try {
          const {
            name,
            image,
            price,
            originCountry,
            rating,
            quantity,
            userId,
          } = req.body;

          if (
            !name ||
            !image ||
            !price ||
            !originCountry ||
            !rating ||
            !quantity
          )
            return res
              .status(400)
              .send({ success: false, message: "All fields are required" });

          const newProduct = {
            _id: new ObjectId().toString(),
            userId,
            name,
            image,
            price: Number(price),
            originCountry,
            rating: Number(rating),
            quantity: Number(quantity),
            importedQuantity: 0,
            createdAt: new Date(),
          };

          const db = client.db("ImportExport-db");
          const dataCollection = db.collection("data");
          const result = await dataCollection.insertOne(newProduct);

          res.send({ success: true, data: result });
        } catch (err) {
          console.error(err);
          res
            .status(500)
            .send({ success: false, message: "Failed to add product" });
        }
      });

      // Get all exports of a user
      app.get("/my-exports/:userId", async (req, res) => {
        try {
          const { userId } = req.params;
          const db = client.db("ImportExport-db");
          const dataCollection = db.collection("data");
          const exports = await dataCollection.find({ userId }).toArray();
          res.send(exports);
        } catch (err) {
          console.error(err);
          res.status(500).send({ message: "Failed to fetch exports" });
        }
      });

      // Delete a product by id
      app.delete("/my-exports/:id", async (req, res) => {
        try {
          const { id } = req.params;
          const db = client.db("ImportExport-db");
          const dataCollection = db.collection("data");
          const result = await dataCollection.deleteOne({ _id: id });
          res.send(result);
        } catch (err) {
          console.error(err);
          res.status(500).send({ message: "Failed to delete product" });
        }
      });

      // Update a product by id
      app.patch("/my-exports/:id", async (req, res) => {
        try {
          const { id } = req.params;
          const updateFields = req.body; // { name, image, price, originCountry, rating, quantity }

          const db = client.db("ImportExport-db");
          const dataCollection = db.collection("data");
          const result = await dataCollection.updateOne(
            { _id: id },
            { $set: updateFields }
          );

          res.send({ success: true, updated: result });
        } catch (err) {
          console.error(err);
          res.status(500).send({ message: "Failed to update product" });
        }
      });

      res.send(result);
    });

    console.log("Backend running & MongoDB connected!");
  } finally {
    // Uncomment only if you want to close connection
    // client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => console.log(`Server running on port ${port}`));

//-----------------------------------
// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const { MongoClient, ServerApiVersion } = require("mongodb");
// const app = express();
// const port = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());
// const uri = process.env.MONGO_URI;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     await client.connect();

//     const db = client.db("ImportExport-db");
//     const dataCollection = db.collection("data");

//     app.get("/data", async (req, res) => {
//       const result = await dataCollection.find().toArray();
//       res.send(result);
//     });

//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });
// //71T2qLbd0bFm0GzC
