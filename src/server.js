/*  package installed
install express package
npm install --save express

install packages to use ES6 syntax, which is auto configured in React for front end part
npm install --save-dev @babel/core @babel/node @babel/preset-env

Run server:
npx babel-node src/server.js

install packages to parse request json body
npm install --save body-parser

auto restart serve for saved change
npm install --save-dev nodemon

Run server after installing nodemon (also saved into package.json as a script "start")
npx nodemon --exec npx babel-node src/server.js

Install Mongodb
npm install --save mongodb


*/

import express from 'express';
import bodyParser from 'body-parser';
import { MongoDlient, MongoClient } from 'mongodb';
import path from 'path';

const app = express();
// let program know where the static files are (need import path module, which is already contained in nodejs)
app.use(express.static(path.join(__dirname,'/build'))); 
// let program know how to parse json file retrieved
app.use(bodyParser.json());
const withDB = async (operations, res) => {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
    const db = client.db('my-blog');
    await operations(db);
    client.close;
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to db', error })
  }
}

app.get('/api/articles/:name', async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;
    const articleInfo = await db.collection('articles').findOne({ name: articleName })
    res.status(200).json(articleInfo);
  }, res);
});

app.post('/api/articles/:name/upvote', async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;
    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    await db.collection('articles').updateOne({ name: articleName }, {
      '$set': {
        upvotes: articleInfo.upvotes + 1,
      },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
    res.status(200).json(updatedArticleInfo);
  }, res);
});

app.post('/api/articles/:name/add-comment', (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;

  withDB(async (db) => {
    const articleInfo = await db.collection('articles').findOne({name: articleName});
    await db.collection('articles').updateOne({ name: articleName }, {
      '$set': {
        comments: articleInfo.comments.concat({ username, text}),
      },
    });
    const updatedArticleInfo = await db.collection('articles').findOne({name: articleName})
    res.status(200).json(updatedArticleInfo);
  }, res);
});

app.get('*', (req, res) => {
  res.sendFile(path,join(__dirname + '/build/index.html'));
});

app.listen(8000, () => console.log('Listening on port 8000'));