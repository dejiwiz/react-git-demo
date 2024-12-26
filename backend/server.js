const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',  // Define OpenAPI version
      info: {
        title: 'API Documentation',  // Title of the documentation
        version: '1.0.0',  // Version of the API
        description: 'API documentation for the To-Do List app',  // Description of the API
      },
    },
    apis: ['./server.js'],  // Correct path to your server.js file
  };
  
  
  // Generate swagger docs
  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  
app.use(express.json());
app.use(cors());

// Serve swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to MongoDB
mongoose.connect('mongodb+srv://strawberryd100:fRaQRr3CPYbFVTi7@cluster0.ew6ce.mongodb.net/react-git-demo?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB:', err));


//Defining a Schema
const taskSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
});


//Creating a Model
const Task = mongoose.model('Task', taskSchema);

// API routes 

// POST Route to Create a Task
/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     description: This endpoint allows you to create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Buy groceries"
 *     responses:
 *       200:
 *         description: Task created successfully
 *       500:
 *         description: Internal server error
 */

//POST Route to Create a Task
app.post('/tasks', async (req, res) => {
try{
  const task = new Task({
    text: req.body.text,
    completed: false,
  });
  await task.save();
  res.json({ id: task._id, text: task.text, completed: task.completed});
} catch (error) {
  res.status(500).json({ error: 'Failed to create task'});
}
});

// GET Route to Retrieve All Tasks
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Retrieve a list of tasks
 *     description: Fetch all tasks from the database
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   text:
 *                     type: string
 *                   completed:
 *                     type: boolean
 */
// GET Route to Retrieve All Tasks
app.get('/tasks', async (req, res) => {
 try {
  const tasks = await Task.find();
  const response = tasks.map(task => ({
    id: task._id,
    text: task.text,
    completed: task.completed,
  }));
  res.json(response);
} catch (error) {
    res.status(500).json({ error: 'Failed to fetch task'});
}
});

// DELETE Route to Remove a Task
/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: This endpoint allows you to delete a task by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Invalid task ID
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
// DELETE Route to Remove a Task
app.delete('/tasks/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({ error: 'Invalid Task ID' });
      }
      const task = await Task.findByIdAndDelete(taskId);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error); // Log error details
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });


  // PUT Route to Update Task Completion
/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update task completion status
 *     description: This endpoint allows you to update the completion status of a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The task ID
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         description: The updated task completion status
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             completed:
 *               type: boolean
 *               example: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
// PUT Route to Update Task Completion
app.put('/tasks/:id', async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { completed: req.body.completed }, // Update the completed status
        { new: true } // Return the updated task
      );
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ id: task._id, text: task.text, completed: task.completed });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  
// Start the server
app.listen(5000, () => {
  console.log('Backend server running on http://localhost:5000');
});
