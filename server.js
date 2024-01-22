const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(bodyParser.json());

console.log('Starting server...');

const url = 'mongodb://localhost:27017/';
const dbName = 'todo_app';

async function startServer() {
  try {
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);

//----------------------------------------------------------Routes for Lists

    // Route to get all lists
  
    app.get('/lists', async (req, res) => {
      try{
        const lists = await db.collection('lists').find({}).toArray();
        res.status(200).json(lists);
      }
    catch(error){
      console.error('Error getting lists:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    });

    //Route to add a list
    app.post('/lists', async (req, res) => {
      const newList = { name: req.body.name };

      try {
        const result = await db.collection('lists').insertOne(newList);

        console.log('Insert result:', result); 

        if (result.insertedId) {
      // Fetch the inserted document using the _id
      const insertedDocument = await db.collection('lists').findOne({ _id: result.insertedId });
      
      if (insertedDocument) {
        res.status(201).json(insertedDocument);
      } else {
        console.error('Error adding list - inserted document not found:', result.insertedId);
        res.status(500).send('Internal Server Error');
      }
    } else {
      console.error('Error adding list - insertedId is undefined:', result);
      res.status(500).send('Internal Server Error');
    }
  } catch (error) {
    console.error('Error adding list:', error);
    res.status(500).send('Internal Server Error');
  }
    });

    // Route to update a list
    app.put('/lists/:listId', async (req, res) => {
      const listId = req.params.listId;
      const newName = req.body.name;

      try {
        const result = await db.collection('lists').updateOne(
          { _id: new ObjectId(listId) },
          { $set: { name: newName } }
        );

        if (result.matchedCount > 0) {
          res.status(200).json({ message: 'List updated successfully' });
        } else {
          res.status(404).json({ error: 'List not found' });
        }
      } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    //Route to delete a aList
    app.delete('/lists/:listId', async (req, res) => {
      const listId = req.params.listId;
    
      try {
        const result = await db.collection('lists').deleteOne({ _id: new ObjectId(listId) });
    
        if (result.deletedCount > 0) {
          res.status(200).json({ message: 'List deleted successfully' });
        } else {
          res.status(404).json({ error: 'List not found' });
        }
      } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

//----------------------------------------------------------Routes for Tasks
      // Route to get tasks for a specific list
      app.get('/lists/:listId/tasks', async (req, res) => {
      const listId = req.params.listId;
      const tasks = await db.collection('tasks').find({ listId }).toArray();
      res.status(200).json(tasks);
      });


      // Route to add a new task to a specific list
      app.post('/lists/:listId/tasks', async (req, res) => {
      const listId = req.params.listId;
      const newTask = { listId, description: req.body.description, completed: false };

      try {
      const result = await db.collection('tasks').insertOne(newTask);
      res.status(201).json(result.ops[0]);
      } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).send('Internal Server Error');
      }
    });
    

    //Check if server is running
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }


}

startServer();
