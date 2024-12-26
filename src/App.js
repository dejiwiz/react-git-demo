import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State to manage the list of tasks and the new task input
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');


  // Fetch tasks from the backend
  useEffect(() => {
    axios.get('http://localhost:5000/tasks')
      .then(response => setTasks(response.data))
      .catch(error=> console.error('Error fetching tasks', error));
  }, []);


  // Add task to backend and state
  // Function to add a new task
  const addTask = () => {
    if (newTask && newTask.trim()) {  // Check if newTask is not undefined and not empty
      axios
      .post('http://localhost:5000/tasks', {text: newTask})
      .then(response => {
      // setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
        setTasks([...tasks, response.data]);
        setNewTask('');  // Clear input after adding the task
    })
      .catch(error => console.error('Error adding task', error));
    }
  };

  // Function to toggle task completion status
  // const toggleTaskCompletion = (taskId) => {
  //   setTasks(tasks.map(task => 
  //     task._id === taskId ? { ...task, completed: !task.completed } : task
  //   ));
  // };

    // Function to toggle task completion status
    const toggleTaskCompletion = (taskId) => {
      // Update task completion in frontend
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task // Use _id here
      );
      setTasks(updatedTasks);
  
      // Update the completion status in the backend
      axios.put(`http://localhost:5000/tasks/${taskId}`, { completed: !updatedTasks.find(task => task.id === taskId).completed }) // Use _id here too
        .catch(error => console.error('Error updating task completion', error));
    };
  

  // Delete task from backend and state
  // Function to delete a task
  const deleteTask = (taskId) => {
    axios.delete(`http://localhost:5000/tasks/${taskId}`)
     .then(() => setTasks(tasks.filter(task => task.id !== taskId)))
     .catch(error => console.error('Error deleting task', error));    
  };


    // Function to handle Enter key press
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {  // Check if the Enter key is pressed
        addTask();
      }
    };

return (
    <div className="App">
      <h1>To-Do List</h1>
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Enter a new task"
        onKeyDown={handleKeyDown}
      />
      <button onClick={addTask}>Add Task</button>

      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            {/* Toggle slider at the beginning */}
            <label className="switch">
              <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={() => toggleTaskCompletion(task.id, task.completed)}
              />
              <span className="slider"></span>
            </label>

            {/* Task Text Header */}
            <span className="task-name">{task.text}</span>

            {/* Completed status */}
            <span className={`status ${task.completed ? 'completed' : 'not-completed'}`}>
              {task.completed ? 'Completed' : 'Not Completed'}
            </span>

            {/* Delete Button */}
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
