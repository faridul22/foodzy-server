const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


//-------------MongoDB start-------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwjksg9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // database collection
        const popularCollection = client.db("foodzyDB").collection("popularItemsCollection");
        const itemsCollection = client.db("foodzyDB").collection("itemsCollection");
        const userCollection = client.db("foodzyDB").collection("userCollection");
        const serveCollection = client.db("foodzyDB").collection("serveCollection");

        //---------------------Search---------------------

        app.get("/getToyNameByText/:text", async (req, res) => {
            const searchText = req.params.text;
            const result = await itemsCollection
                .find({
                    $or: [
                        { title: { $regex: searchText, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });

        //-----------------------------------------------

        // popular item route
        app.get('/popularItems', async (req, res) => {
            const itemsData = popularCollection.find();
            const result = await itemsData.toArray();
            res.send(result)
        })
        // serve route
        app.get('/serve', async (req, res) => {
            const serveData = serveCollection.find();
            const result = await serveData.toArray();
            res.send(result)
        })

        // items route

        app.get('/items', async (req, res) => {
            const itemsData = itemsCollection.find();
            const result = await itemsData.toArray();
            res.send(result)
        })
        app.get('/items/:id', async (req, res) => {
            const id = req.params.id
            const itemsData = await itemsCollection.findOne({ _id: new ObjectId(id) });
            res.send(itemsData)
        })
        app.post('/items', async (req, res) => {
            const itemsData = req.body;
            const result = await itemsCollection.insertOne(itemsData);
            res.send(result)
        })
        app.patch('/items/:id', async (req, res) => {
            const id = req.params.id
            const updatedData = req.body;
            const itemsData = await itemsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );
            res.send(itemsData)
        })
        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const itemsData = await itemsCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(itemsData)
        })

        // user routes
        app.get('/user/get/:id', async (req, res) => {
            const id = req.params.id;
            const result = await userCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        })

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const result = await userCollection.findOne({ email });
            res.send(result);
        })

        app.post('/user', async (req, res) => {
            const user = req.body;
            const isUserExist = await userCollection.findOne({ email: user?.email });
            if (isUserExist?._id) {
                return res.send({
                    status: "Success",
                    message: "Login success"
                })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.patch('/user/:email', async (req, res) => {
            const email = req.params.email;
            const userData = req.body;
            const result = await userCollection.updateOne({ email }, { $set: userData }, { upsert: true });
            res.send(result);
        })


        console.log("successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

//-------------MongoDB end---------------

app.get('/', (req, res) => {
    res.send('foodzy server is running')
});

app.listen(port, () => {
    console.log(`foodzy server is running on port: ${port}`);
})