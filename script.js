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

// Function to render tasks
function renderTasks() {
  const tasksContainer = $('#tasks-container');
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
$('#add-task').click(function () {
  const list = prompt('Enter the list for the new task:');
  const task = prompt('Enter a new task:');
  const dueDate = prompt('Enter the due date (YYYY-MM-DD):');
  const status = prompt('Enter the status (in-progress, not-started, finished):');

  if (list && task && dueDate && status) {
    tasks.push({ list, task, dueDate, status });
    render();
  }
});

// Document ready function
$(document).ready(function () {
  render();
});
