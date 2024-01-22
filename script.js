  //script.js

  const SERVER_URL = 'http://localhost:3000';
  let selectedListId;
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
      
      // Set the selected list
      setSelectedList(selectedListId);
    
      // Add 'selected' class to the clicked list item
      $(this).addClass('selected');

      // Re-render the page to show tasks of the selected list
      renderTasks(selectedListId);
    });

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

      tasks.forEach(task => {
        const taskItem = $(`<li class="task-item">${task.description}</li>`);
        tasksContainer.append(taskItem);
      });
    }
}

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

  // Initial rendering of lists
  renderLists();


//-----------------------------------------------------------------------TASKS


async function fetchTasks(listId) {
  const response = await fetch(`${SERVER_URL}/lists/${listId}/tasks`);
  return response.json();
}

async function renderTasks(listId) {
  const tasksContainer = $('#tasks-container');
  tasksContainer.empty();

  const tasks = await fetchTasks(listId);

  tasks.forEach(task => {
    const taskItem = $(`<li class="task-item">${task.description}</li>`);
    tasksContainer.append(taskItem);
  });
}

// async function addNewTask(listId) {
//   const newTaskDescription = prompt('Enter a new task:');
//   if (newTaskDescription) {
//     const newTask = { description: newTaskDescription };

//     try {
//       const response = await fetch(`${SERVER_URL}/lists/${listId}/tasks`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(newTask),
//       });

//       const data = await response.json();
//       console.log('New task added:', data);

//       // After adding a new task, re-render the tasks for the selected list
//       renderTasks(listId);
//     } catch (error) {
//       console.error('Error adding task:', error);
//     }
//   }
// }

// // Event listener for adding a new task
// $(document).on('click', '#add-task', addNewTask);

// // Event listener for selecting a list and rendering tasks
// $('#lists-container').on('click', '.list-item', function () {
//   const listId = $(this).data('list-id');
//   $('.list-item').removeClass('selected');
// });
