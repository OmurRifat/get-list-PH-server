const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qogqlqn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);


async function run() {
    try {
        const powerHackUser = client.db('PowerHack').collection('users');
        const powerHackBillings = client.db('PowerHack').collection('billings');


        app.post('/api/registration', async (req, res) => {
            const user = req.body;
            // const query = {email: user.email}
            // const data = await findOne(query);
            // if(user.email === data.email){
            //     res.send()
            // }
            const result = await powerHackUser.insertOne(user);
            if (result.acknowledged === true) {
                res.send({ status: 200, token: process.env.ACESS_TOKEN })
            }
            else
                res.send({ status: 400 })
        })

        app.post('/api/login', async (req, res) => {
            const user = req.body;
            const query = { email: user.email, password: user.password }
            const result = await powerHackUser.findOne(query);
            console.log(result)
            if (result?._id) {
                res.send({ status: 200, token: process.env.ACESS_TOKEN })
            }
            else {
                res.send({ status: 400 })
            }
        })

        app.post('/api/add-billing', async (req, res) => {
            const newBilling = req.body;
            const result = await powerHackBillings.insertOne(newBilling);
            if (result.acknowledged === true) {
                res.send({ status: 200 })
            }
            else
                res.send({ status: 400 })
        })

        app.get('/api/billing-list', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = 10;
            const query = {};
            const result = await powerHackBillings.find(query).skip(page * size).limit(size).toArray();
            const count = await powerHackBillings.estimatedDocumentCount();
            res.send({ count, result });
        })

        app.delete('/api/delete-billing/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = powerHackBillings.deleteOne(query);
            if ((await result).deletedCount === 1)
                res.send({ status: 200 })
            else
                res.send({ status: 400 })
        })

        app.put('/api/update-billing/:id', async (req, res) => {
            const id = req.params.id;
            const updatedDoc = req.body;
            const filter = { _id: ObjectId(id) };
            const addedDoc = {
                $set: {
                    name: updatedDoc.name,
                    email: updatedDoc.email,
                    phone: updatedDoc.phone,
                    ammount: updatedDoc.ammount

                }
            }
            const result = await powerHackBillings.updateOne(filter, addedDoc)
            if (result.acknowledged === true) {
                res.send({ status: 200 })
            }
            else
                res.send({ status: 400 })

        })


    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send("Server is Running...")
})


app.listen(port, () => {
    console.log("Listening from Port: ", port)
})