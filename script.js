  //script.js

  const SERVER_URL = 'http://localhost:3000';
  let selectedListId;
  let selectedTaskId;
  let lists;

  // Function to fetch lists from the server
  async function fetchLists() {
    const response = await fetch(`${SERVER_URL}/lists`);
    return response.json();
  }

  //---------------------------------------------------------------------Lists

  function setSelectedList(listId) {
    selectedListId = listId;
  }
  
  function getSelectedList() {
    return selectedListId || (lists && lists.length > 0 ? lists[0]._id : null); //Default to the first list if none is selected
  }

  // Function to render lists
  async function renderLists() {
    const listsContainer = $('#lists-container');
    listsContainer.empty();

    const selectedList = getSelectedList();

    const lists = await fetchLists();

    lists.forEach(list => {
      const isSelected = selectedList && selectedList.name === list.name;
      const listItem = $(`<li class="list-item${isSelected ? ' selected' : ''}" data-list-id="${list._id}">${list.name}</li>`);
      listsContainer.append(listItem);
    });

  // Event listener for clicking on a list item
  listsContainer.on('click', '.list-item', function () {
      const selectedListId = $(this).data('list-id');
      
      // Remove 'selected' class from all list items
      $('.list-item').removeClass('selected');

      // Set the selected list
      setSelectedList(selectedListId);
    
      // Add 'selected' class to the clicked list item
      $(this).addClass('selected');

      // Re-render the page to show tasks of the selected list
      renderTasks(selectedListId);
    });
}

//Function to add a List
  async function addNewList() {
    const newListName = prompt('Enter a new list name:');
    if (newListName) {
      const newList = { name: newListName };

      try {
        const response = await fetch(`${SERVER_URL}/lists`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newList),
        });

        const data = await response.json();
        console.log('New list added:', data);

        // After adding a new list, re-render the lists
        await renderLists();
      } catch (error) {
        console.error('Error adding list:', error);
      }
    }
  }

// Event listener for adding a new list
$(document).on('click', '#add-list', addNewList);

// Function to handle editing the selected list
async function editList() {
  const selectedListId = getSelectedList();
  
  if (selectedListId) {
    const newListName = prompt('Enter the new name for the list:');
    
    if (newListName) {
      try {
        const response = await fetch(`${SERVER_URL}/lists/${selectedListId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newListName }),
        });

        const data = await response.json();
        console.log('List updated:', data);

        // Re-render the lists after updating
        await renderLists();
      } catch (error) {
        console.error('Error updating list:', error);
      }
    }
  } else {
    alert('Please select a list to edit.');
  }
}

// Event listener for Edit List
$(document).on('click', '#edit-list', editList);

//Function do delete a List
async function deleteList() {
  const selectedListId = getSelectedList();

  if (selectedListId) {

    // Ask for confirmation
    const confirmation = window.confirm('Are you sure you want to delete this task?');

    if(confirmation){
      try {
        //DELETE request to remove the list
        const response = await fetch(`${SERVER_URL}/lists/${selectedListId}`, {
          method: 'DELETE',
        });
  
        const data = await response.json();
        console.log('List deleted:', data);
  
        // Clear the selected list after deletion
        setSelectedList(null);
  
        // Re-render the lists after deleting
        await renderLists();

        // Delete tasks associated with the list
        const deleteTasksResponse = await fetch(`${SERVER_URL}/lists/${selectedListId}/tasks`, {
          method: 'DELETE',
        });

        const deleteTasksData = await deleteTasksResponse.json();
        console.log('Tasks deleted:', deleteTasksData);

        // Re-render the tasks after deleting to update the tasks container
        renderTasks(getSelectedList());
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    } else {
      alert('Please select a list to delete.');
    }
    }
}

// Event listener for deleting a list
$(document).on('click', '#delete-list', deleteList);

  // Initial rendering of lists
  renderLists();


//-----------------------------------------------------------------------TASKS

// Function to set the selected task ID
function setSelectedTaskId(taskId) {
  selectedTaskId = taskId;
}

// Function to get the selected task ID
function getSelectedTaskId() {
  return selectedTaskId;
}

async function fetchTasks(listId) {
  const response = await fetch(`${SERVER_URL}/lists/${listId}/tasks`);
  return response.json();
}

 // Function to fetch and render tasks for the selected list
 async function renderTasks(selectedListId) {
  // Use the selectedListId to fetch and render tasks
  const tasks = await fetchTasks(selectedListId);
  
  // Render tasks in the UI
  renderTasksInUI(tasks);
}

// Helper function to render tasks in the UI
function renderTasksInUI(tasks) {
  const tasksContainer = $('#tasks-container');
  tasksContainer.empty();

  const selectedTaskId = getSelectedTaskId();

  tasks.forEach(task => {
    // Create a checkbox based on the task status
    const checkbox = $(`<input type="checkbox" ${task.status === 'inProgress' ? '' : 'checked'}>`);
    const isSelected = selectedTaskId === task._id;


    // Create a list item containing the checkbox, task description, and due date
    const taskItem = $(`<li class="task-item${isSelected ? ' selected' : ''}" data-task-id="${task._id}"></li>`);
    taskItem.append(checkbox);
    taskItem.append(`${task.description} (Due: ${task.dueDate})`);

    //Event listener for clicking on a task
    tasksContainer.on('click', '.task-item', function () {
      const selectedTaskId = $(this).data('task-id');
      handleTaskSelection(selectedTaskId);
    });

    //taskItem.append(checkbox, label);
    tasksContainer.append(taskItem);

    // Add an event listener to update task status when the checkbox is clicked
    checkbox.on('change', async function () {
    const newStatus = this.checked ? 'completed' : 'inProgress';
    await updateTaskStatus(task._id, newStatus);
    // After updating the task status, re-render the tasks for the selected list
    renderTasks(getSelectedList());
    });
  });
}

// Function to handle task selection and rendering
function handleTaskSelection(taskId) {
  // Remove 'selected' class from all task items
  $('.task-item').removeClass('selected');

  // Set the selected task ID
  setSelectedTaskId(taskId);

  // Add 'selected' class to the clicked task
  $(`[data-task-id="${taskId}"]`).addClass('selected');
}

// Event listener for selecting a task and rendering tasks
$('#tasks-container').on('click', '.task-item', function () {
  const selectedTaskId = $(this).data('task-id');
  handleTaskSelection(selectedTaskId);
});

// Function to update task status
async function updateTaskStatus(taskId, newStatus) {
try {
  const response = await fetch(`${SERVER_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),
  });
  const data = await response.json();
  console.log('Task status updated:', data);
  } 
catch (error) {
  console.error('Error updating task status:', error);
  }
}

//Function to add Task
async function addNewTask(listId) {
  
  // Check if a list is selected
  if (!listId) {
    alert('Please select a list before adding a task.');
    return;
  }

  const newTaskDescription = prompt('Enter a new task:');
  const newTaskDueDate = prompt('Enter the due date for the task (format: DD-MM-YYYY):');
  if (newTaskDescription && newTaskDescription) {
    const newTask = { description: newTaskDescription , dueDate: newTaskDueDate };

    try {
      const response = await fetch(`${SERVER_URL}/lists/${listId}/tasks`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      const data = await response.json();
      console.log('New task added:', data);

      // After adding a new task, re-render the tasks for the selected list
      renderTasks(listId);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }
  else{
    alert('Please fill all the fields.');
  }
}

// Event listener for adding a new task
$(document).on('click', '#add-task', function () {
  const selectedListId = getSelectedList();
  addNewTask(selectedListId);
});

// Function to handle editing a task
async function editTask() {
  const selectedTaskId = getSelectedTaskId();

  if (selectedTaskId) {
    const newTaskDescription = prompt('Enter the new task description:');
    const newDueDate = prompt('Enter the new due date (format: DD-MM-YYYY):');
    
    if (newTaskDescription || newDueDate) {
      const updatedTask = {};

      if (newTaskDescription) {
        updatedTask.description = newTaskDescription;
      }

      if (newDueDate) {
        updatedTask.dueDate = newDueDate;
      }

      try {
        const response = await fetch(`${SERVER_URL}/tasks/${selectedTaskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTask),
        });

        const data = await response.json();
        console.log('Task updated:', data);

        // After updating the task, re-render the tasks for the selected list
        renderTasks(getSelectedList());
      } catch (error) {
        console.error('Error updating task:', error);
      }
    } else {
      alert('No changes made. Task remains unchanged.');
    }
  } else {
    alert('Please select a task to edit.');
  }
} 
  
// Event listener for editing a task
$(document).on('click', '#edit-task', editTask);

// Function to delete a task
async function deleteTask() {
  const selectedTaskId = getSelectedTaskId();

  if (selectedTaskId) {

    // Ask for confirmation
    const confirmation = window.confirm('Are you sure you want to delete this task?');

    if(confirmation){
      try {
        const response = await fetch(`${SERVER_URL}/tasks/${selectedTaskId}`, {
          method: 'DELETE',
        });
  
        const data = await response.json();
        console.log('Task deleted:', data);
  
        // Clear the selected task after deletion
        setSelectedTaskId(null);
  
        // Re-render the tasks after deleting
        renderTasks(getSelectedList());
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    } else {
      alert('Please select a task to delete.');
    }
    }
}

// Event listener for deleting a task
$(document).on('click', '#delete-task', deleteTask);






