const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// 
// 

// middleware
app.use(cors());
app.use(express.json());


//-------------MongoDB start-------------

const uri = "mongodb+srv://foodzy:jwMU5e6ys9JgFX9f@cluster0.xwjksg9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

        const itemsDB = client.db("itemsDB");
        const itemsCollection = itemsDB.collection("itemsCollection");

        // items route
        app.post('/items', async (req, res) => {
            const itemsData = req.body;
            const result = await itemsCollection.insertOne(itemsData);
            res.send(result)
        })
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