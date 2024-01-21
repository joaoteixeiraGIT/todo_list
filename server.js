//server.js

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

//replace this MongoDB setup
let tasks = [];

// Route to add a new task
app.post('/tasks', (req, res) => {
  const newTask = req.body;
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Route to edit a task
app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);  // Assuming the ID is a number
    const taskIndex = tasks.findIndex(task => task.id === taskId);
  
    if (taskIndex !== -1) {
      const updatedTask = req.body;
      Object.assign(tasks[taskIndex], updatedTask);
      res.json(tasks[taskIndex]);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  });

// Route to delete a task
app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);  // Assuming the ID is a number ----------------------------change--------
    const taskIndex = tasks.findIndex(task => task.id === taskId);
  
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
      res.status(204).send();  // No content
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
