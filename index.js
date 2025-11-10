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
//     const importCollection = db.collection("imports");

//     app.get("/latestProducts", async (req, res) => {
//       try {
//         const result = await dataCollection
//           .find()
//           .sort({ createdAt: -1 }) // latest first
//           .limit(6)
//           .toArray();
//         res.send(result);
//       } catch (error) {
//         res
//           .status(500)
//           .send({ message: "Failed to fetch latest products", error });
//       }
//     });

//     app.get("/data", async (req, res) => {
//       const result = await dataCollection.find().toArray();
//       res.send(result);
//     });

//     // Single product details
//     app.get("/data/:id", async (req, res) => {
//       const id = req.params.id;
//       const product = await dataCollection.findOne({ _id: id });
//       res.send(product);
//     });

//     // Import product
//     // app.patch("/import/:id", async (req, res) => {
//     //   const id = req.params.id;
//     //   const { importQuantity, userId } = req.body;

//     //   const product = await dataCollection.findOne({ _id: id });
//     //   if (!product) {
//     //     return res.status(404).send({ message: "Product not found" });
//     //   }

//     //   if (importQuantity > product.quantity) {
//     //     return res
//     //       .status(400)
//     //       .send({ message: "Import quantity exceeds available" });
//     //   }

//     //   const result = await dataCollection.updateOne(
//     //     { _id: id },
//     //     {
//     //       $inc: {
//     //         quantity: -importQuantity,
//     //         importedQuantity: importQuantity,
//     //       },
//     //     }
//     //   );

//     //   res.send(result);
//     // });
//     app.patch("/import/:userId", async (req, res) => {
//       const id = req.params.id;
//       const { importQuantity, userId } = req.body;

//       const product = await dataCollection.findOne({ _id: id });
//       if (!product) {
//         return res.status(404).send({ message: "Product not found" });
//       }

//       if (importQuantity > product.quantity) {
//         return res
//           .status(400)
//           .send({ message: "Import quantity exceeds available quantity" });
//       }

//       // 1️⃣ Quantity কমানো
//       const result = await dataCollection.updateOne(
//         { _id: id },
//         {
//           $inc: { quantity: -importQuantity },
//         }
//       );

//       // 2️⃣ ImportCollection-এ রেকর্ড যোগ করা
//       const importData = {
//         productId: id,
//         userId,
//         name: product.name,
//         image: product.image,
//         price: product.price,
//         rating: product.rating,
//         originCountry: product.originCountry,
//         importedQuantity: importQuantity,
//         createdAt: new Date(),
//       };

//       const importResult = await importCollection.insertOne(importData);

//       res.send({ success: true, updated: result, imported: importResult });
//     });

//     // Get all imports of a user
//     app.get("/my-imports/:userId", async (req, res) => {
//       const { userId } = req.params;
//       const result = await importCollection.find({ userId }).toArray();
//       res.send(result);
//     });

//     // Delete an import by id
//     app.delete("/my-imports/:id", async (req, res) => {
//       const { id } = req.params;
//       const result = await importCollection.deleteOne({
//         _id: new ObjectId(id),
//       });
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
//---------------------------------------------------------
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
//     const importCollection = db.collection("imports");

//     app.get("/latestProducts", async (req, res) => {
//       try {
//         const result = await dataCollection
//           .find()
//           .sort({ createdAt: -1 }) // latest first
//           .limit(6)
//           .toArray();
//         res.send(result);
//       } catch (error) {
//         res
//           .status(500)
//           .send({ message: "Failed to fetch latest products", error });
//       }
//     });

//     app.get("/data", async (req, res) => {
//       const result = await dataCollection.find().toArray();
//       res.send(result);
//     });

//     // Single product details
//     app.get("/data/:id", async (req, res) => {
//       const id = req.params.id;
//       const product = await dataCollection.findOne({ _id: id });
//       res.send(product);
//     });

//     // Import product
//     // app.patch("/import/:id", async (req, res) => {
//     //   const id = req.params.id;
//     //   const { importQuantity, userId } = req.body;

//     //   const product = await dataCollection.findOne({ _id: id });
//     //   if (!product) {
//     //     return res.status(404).send({ message: "Product not found" });
//     //   }

//     //   if (importQuantity > product.quantity) {
//     //     return res
//     //       .status(400)
//     //       .send({ message: "Import quantity exceeds available" });
//     //   }

//     //   const result = await dataCollection.updateOne(
//     //     { _id: id },
//     //     {
//     //       $inc: {
//     //         quantity: -importQuantity,
//     //         importedQuantity: importQuantity,
//     //       },
//     //     }
//     //   );

//     //   res.send(result);
//     // });
//     app.patch("/import/:userId", async (req, res) => {
//       const id = req.params.id;
//       const { importQuantity, userId } = req.body;

//       const product = await dataCollection.findOne({ _id: id });
//       if (!product) {
//         return res.status(404).send({ message: "Product not found" });
//       }

//       if (importQuantity > product.quantity) {
//         return res
//           .status(400)
//           .send({ message: "Import quantity exceeds available quantity" });
//       }

//       // 1️⃣ Quantity কমানো
//       const result = await dataCollection.updateOne(
//         { _id: id },
//         {
//           $inc: { quantity: -importQuantity },
//         }
//       );

//       // 2️⃣ ImportCollection-এ রেকর্ড যোগ করা
//       const importData = {
//         productId: id,
//         userId,
//         name: product.name,
//         image: product.image,
//         price: product.price,
//         rating: product.rating,
//         originCountry: product.originCountry,
//         importedQuantity: importQuantity,
//         createdAt: new Date(),
//       };

//       const importResult = await importCollection.insertOne(importData);

//       res.send({ success: true, updated: result, imported: importResult });
//     });

//     // Get all imports of a user
//     app.get("/my-imports/:userId", async (req, res) => {
//       const { userId } = req.params;
//       const result = await importCollection.find({ userId }).toArray();
//       res.send(result);
//     });

//     // Delete an import by id
//     app.delete("/my-imports/:id", async (req, res) => {
//       const { id } = req.params;
//       const result = await importCollection.deleteOne({
//         _id: new ObjectId(id),
//       });
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
//-------------------------------------------
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

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
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    console.log("Backend running & MongoDB connected!");
  } finally {
    // client.close(); // Uncomment only if you want to close connection
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
