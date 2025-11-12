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
//71T2qLbd0bFm0GzC

// ------------------------------
//  Import-Export Backend Server
// ------------------------------

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

    app.get("/latestProducts", async (req, res) => {
      const result = await dataCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/data", async (req, res) => {
      const result = await dataCollection.find().toArray();
      res.send(result);
    });

    app.get("/data/:id", async (req, res) => {
      const { id } = req.params;
      const product = await dataCollection.findOne({ _id: id });
      if (!product) return res.status(404).send({ message: "Not found" });
      res.send(product);
    });

    app.post("/add-exports", async (req, res) => {
      const { name, image, price, originCountry, rating, quantity, userId } =
        req.body;

      if (!name || !image || !price || !originCountry || !rating || !quantity) {
        return res
          .status(400)
          .send({ success: false, message: "All fields are required" });
      }

      const newProduct = {
        _id: new ObjectId().toString(),
        userId,
        name,
        image,
        price: Number(price),
        originCountry,
        rating: Number(rating),
        quantity: Number(quantity),
        createdAt: new Date(),
        importedUsers: [],
      };

      const result = await dataCollection.insertOne(newProduct);
      res.send({ success: true, data: result });
    });

    app.get("/my-exports/:userId", async (req, res) => {
      const { userId } = req.params;
      const exports = await dataCollection.find({ userId }).toArray();
      res.send(exports);
    });

    app.patch("/my-exports/:id", async (req, res) => {
      const { id } = req.params;
      const updateFields = req.body;
      const result = await dataCollection.updateOne(
        { _id: id },
        { $set: updateFields }
      );
      res.send({ success: true, updated: result });
    });

    app.delete("/my-exports/:id", async (req, res) => {
      const { id } = req.params;
      const result = await dataCollection.deleteOne({ _id: id });
      res.send(result);
    });

    app.post("/import/:userId", async (req, res) => {
      const { userId } = req.params;
      const { productId, importQuantity } = req.body;

      const product = await dataCollection.findOne({ _id: productId });
      if (!product)
        return res.status(404).send({ message: "Product not found" });

      if (importQuantity > product.quantity)
        return res
          .status(400)
          .send({ message: "Import quantity exceeds available quantity" });

      await dataCollection.updateOne(
        { _id: productId },
        {
          $inc: { quantity: -importQuantity },
          $push: {
            importedUsers: {
              userId,
              importQuantity,
              importDate: new Date(),
            },
          },
        }
      );

      res.send({ success: true, message: "Imported successfully" });
    });
    app.get("/my-imports/:userId", async (req, res) => {
      const { userId } = req.params;
      const allProducts = await dataCollection.find().toArray();

      const userImports = allProducts
        .map((product) => {
          const imported = product.importedUsers?.find(
            (u) => u.userId === userId
          );
          if (imported) {
            return {
              _id: new ObjectId().toString(),
              productId: product._id,
              name: product.name,
              image: product.image,
              price: product.price,
              rating: product.rating,
              originCountry: product.originCountry,
              importedQuantity: imported.importQuantity,
              importDate: imported.importDate,
            };
          }
          return null;
        })
        .filter(Boolean);

      res.send(userImports);
    });

    app.delete("/my-imports/:productId/:userId", async (req, res) => {
      const { productId, userId } = req.params;
      const product = await dataCollection.findOne({
        _id: new ObjectId(productId),
      });
      if (!product)
        return res
          .status(404)
          .send({ success: false, message: "Product not found" });
      const newImportedUsers = product.importedUsers.filter(
        (u) => u.userId !== userId
      );
      const result = await dataCollection.updateOne(
        { _id: new ObjectId(productId) },
        { $set: { importedUsers: newImportedUsers } }
      );

      res.send({ success: true, updated: result });
    });

    console.log(" MongoDB connected & Backend running successfully!");
  } finally {
    // connection stays open
  }
}

run().catch(console.dir);

//  Default route
app.get("/", (req, res) => {
  res.send(" Import-Export Server is running successfully!");
});

app.listen(port, () => console.log(` Server running on port: ${port}`));
