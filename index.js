const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
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