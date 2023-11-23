// Sample data
let lists = ['Work', 'Personal'];
let tasks = [
  { list: 'Work', task: 'Finish report', status: 'in-progress', dueDate: '2023-12-01' },
  { list: 'Work', task: 'Finish report', status: 'not-started', dueDate: '2023-12-05' },
  { list: 'Personal', task: 'Go to the gym', status: 'finished', dueDate: '2023-12-10' }
];


function render() {
  renderLists();
  renderTasks();
}


//----------------------------------------------------------------Lists----------------------------------------------
// Function to render lists
function renderLists() {
  const listsContainer = $('#lists-container');
  listsContainer.empty();

  lists.forEach(list => {
    // Check if the list is selected
    const isSelected = getSelectedList() === list;
    const listItem = $(`<li class="list-item${isSelected ? ' selected' : ''}">${list}</li>`);
    listsContainer.append(listItem);
  });

  // Event listener for clicking on a list item
  listsContainer.find('.list-item').click(function () {
    const selectedList = $(this).text().trim();
    // Set the selected list
    setSelectedList(selectedList);
    // Re-render the page to show tasks of the selected list
    render();
  });
}

function setSelectedList(list) {
  sessionStorage.setItem('selectedList', list);
}

function getSelectedList() {
  return sessionStorage.getItem('selectedList') || lists[0]; // Default to the first list if none is selected
}

//Event listener to add a list
$('#add-list').click(function() {
  const newListName = prompt('Enter a new list name:');
  if(newListName){
  lists.push(newListName);
  renderLists();
  }
});

//----------------------------------------------------------------Tasks----------------------------------------------
const tasksContainer = $('#tasks-container');


// Function to render tasks
function renderTasks() {
  tasksContainer.empty();


  // Filter tasks based on the selected list
  const selectedList = getSelectedList();
  const filteredTasks = tasks.filter(task => task.list === selectedList);

  filteredTasks.forEach(task => {
    tasksContainer.append(`
      <li>
        ${task.task} (${task.status}) - Due: ${task.dueDate}
        <button class="edit-task">Edit</button>
        <button class="delete-task" data-list="${task.list}" data-task="${task.task}">Delete</button>
      </li>
    `);
  });
}

// Event listener for adding a new task
$('#add-task').click(function() {
  const list = prompt('Enter the list for the new task:');
  const task = prompt('Enter a new task:');
  const dueDate = prompt('Enter the due date (YYYY-MM-DD):');
  const status = prompt('Enter the status (in-progress, not-started, finished):');

  if (list && task && dueDate && status) {
    tasks.push({ list, task, dueDate, status });
    render();
  }
});

// Event listener for edit a task ---------------------------need to change. Not working very well
tasksContainer.on('click', '.edit-task', function () {
  const taskElement = $(this).closest('li');
  const taskName = taskElement.text().trim().split('(')[0].trim();
  const taskDetails = taskElement.text().trim().replace(taskName, '').replace('-', '').trim();
  
  const taskDueDate = taskDetails.split('Due:')[1].split(')')[0].trim();
  const taskStatus = taskDetails.split(')')[1].split('-')[1].trim();
  
  const newTaskName = prompt('Enter the new task name:', taskName);
  const newDueDate = prompt('Enter the new due date (YYYY-MM-DD):', taskDueDate);
  const newStatus = prompt('Enter the new status:', taskStatus);

  // Check if the user clicked "Cancel" or didn't enter a new task name
  if (newTaskName !== null && newTaskName !== taskName) {
    editTaskAttribute(taskName, 'task', newTaskName);
  }

  // Check if the user clicked "Cancel" or didn't enter a new due date
  if (newDueDate !== null && newDueDate !== taskDueDate) {
    editTaskAttribute(taskName, 'dueDate', newDueDate);
  }

  // Check if the user clicked "Cancel" or didn't enter a new status
  if (newStatus !== null && newStatus !== taskStatus) {
    editTaskAttribute(taskName, 'status', newStatus);
  }

  render();
});

// Function to edit a specific attribute of a task
function editTaskAttribute(taskName, attributeName, newValue) {
  const taskIndex = tasks.findIndex(task => task.task === taskName);
  if (taskIndex !== -1) {
    tasks[taskIndex][attributeName] = newValue;
  }
}

// Event listener for delete a task ------------------------------------need to change
tasksContainer.on('click', '.delete-task', function () {
  const taskIndex = $(this).closest('li').index();  
  const confirmDelete = confirm(`Are you sure you want to delete the task?`);
  
  if (confirmDelete) {
    deleteTask(taskIndex);
    render();
  }
});

function deleteTask(taskIndex) {
  tasks.splice(taskIndex, 1);
}

// Document ready function
$(document).ready(function () {
  render();
});
