import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/", async (req, res) => {
  const response = {status: 'listening for requests'};
  res.json(response);
});

app.post('/todo', async (req, res) => {
  try {
    const {todoBody , todoTitle} = req.body
    const response = await client.query('insert into todo (todo_body, todo_title) values ($1, $2) returning *', [todoBody, todoTitle])
    res.status(200).json(response.rows)
  }catch(error) {
    res.status(400)
    console.error(error)
  }
})

app.get('/todo', async (req, res) => {
  try {
    const response = await client.query('select * from todo order by id desc')
    res.status(200).json(response.rows)
  }catch(error){
    res.status(400).send(error)
    console.error(error)
  }
})

app.delete('/todo/:id', async (req, res) => {
  try{
    const {id} = req.params
    const response = await client.query('delete from todo where id = $1 returning *', [id])
    res.status(200).json(response.rows)
  }catch(error){
    res.status(400).send(error)
  }
})



//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
