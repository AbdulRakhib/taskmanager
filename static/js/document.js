document.addEventListener('DOMContentLoaded', () => {
    const newBoardButton = document.querySelector('.btn-blue');
    const dashboard = document.querySelector('.dashboard .row');
    const modal = document.getElementById('boardNameModal');
    const closeBtn = document.querySelector('.modal .close');
    const createBoardButton = document.getElementById('createBoardButton');
    const boardNameInput = document.getElementById('boardNameInput');

    renderNewBoards();
    renderTasks();

    function renderNewBoards() {
        const boards = JSON.parse(localStorage.getItem('boards')) || [];
        const predefinedBoards = ['Pending', 'In Progress', 'Completed'];
        const filteredBoards = boards.filter(board => !predefinedBoards.includes(board));

        filteredBoards.forEach(boardName => {
            if (!document.getElementById(`${boardName.replace(/\s+/g, '-').toLowerCase()}-board`)) {
                const newBoard = document.createElement('div');
                newBoard.classList.add('col-xl-4', 'col-sm-6');
                newBoard.id = `${boardName.replace(/\s+/g, '-').toLowerCase()}-board`;
                newBoard.innerHTML = `
                    <article class="board" data-board-name="${boardName}">
                        <header>
                            <h4>${boardName} <span>(0)</span></h4>
                        </header>
                        <div class="board-content">
                            <ul class="list"></ul>
                        </div>
                    </article>
                `;
                dashboard.appendChild(newBoard);
            }
        });
    }

    
    function renderTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const inProgressBoard = document.querySelector('#in-progress-board .board-content .list');
        const pendingBoard = document.querySelector('#pending-board .board-content .list');
        const completedBoard = document.querySelector('#completed-board .board-content .list');

        inProgressBoard.innerHTML = '';
        pendingBoard.innerHTML = '';
        completedBoard.innerHTML = '';

        tasks.forEach(task => {
            const taskElement = document.createElement('li');
            taskElement.innerHTML = `
                <div class="task ${task.status}">
                    <header>
                        <h3>${task.name}</h3>
                        <span class="task-actions">
                            <span class="icon flaticon-edit" onclick="editTask(this)" data-id="${task.id}"></span>
                        </span>
                    </header>
                    <header>
                        <span class="task-actions">
                            <span class="icon flaticon-minus" onclick="deleteTask(this)" data-id="${task.id}"></span>
                        </span>
                    </header>
                    <div class="task-content">
                        ${task.description}
                    </div>
                    <div class="task-content">
                        Due Date: ${task.dueDate}
                    </div>
                    <div class="task-content">
                        Priority: ${task.priority}
                    </div>
                    <select class="status-dropdown" data-id="${task.id}">
                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            `;

            if (task.status === 'pending') {
                pendingBoard.appendChild(taskElement);
            } else if (task.status === 'in-progress') {
                inProgressBoard.appendChild(taskElement);
            } else if (task.status === 'completed') {
                completedBoard.appendChild(taskElement);
            }
        });

        updateTaskCounts(filteredTasks);
    }

    // Function to update the task counts in the header of each board
    function updateTaskCounts(filteredTasks) {
        const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
        const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
        const completedTasks = filteredTasks.filter(task => task.status === 'completed');

        inProgressCountElement.textContent = `(${inProgressTasks.length})`;
        pendingCountElement.textContent = `(${pendingTasks.length})`;
        completedCountElement.textContent = `(${completedTasks.length})`;
    }

    // Initially render all tasks
    renderTasks();
    

    function loadBoards() {
        let boards = JSON.parse(localStorage.getItem('boards')) || [];
        const predefinedBoards = ['pending', 'in-progress', 'completed'];
        const taskDropdowns = document.querySelectorAll('.status-dropdown');

        taskDropdowns.forEach(dropdown => {
            dropdown.innerHTML = '';
            predefinedBoards.forEach(status => {
                dropdown.innerHTML += `
                    <option value="${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</option>
                `;
            });
            boards.forEach(board => {
                const option = document.createElement('option');
                option.value = board.replace(/\s+/g, '-').toLowerCase();
                option.textContent = board;
                dropdown.appendChild(option);
            });
        });
    }

    newBoardButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    createBoardButton.addEventListener('click', () => {
        const boardName = boardNameInput.value.trim();
        if (!boardName) {
            alert('Board name cannot be empty.');
            return;
        }
        let boards = JSON.parse(localStorage.getItem('boards')) || [];
        const boardExists = boards.some(existingBoard => 
            existingBoard.toLowerCase() === boardName.toLowerCase()
        );
        if (boardExists) {
            alert(`A board named "${boardName}" already exists.`);
            return;
        }
        boards.push(boardName);
        localStorage.setItem('boards', JSON.stringify(boards));
        renderNewBoards();
        loadBoards();
        modal.style.display = 'none';
    });

    loadBoards();

    document.addEventListener('change', (event) => {
        if (event.target.classList.contains('status-dropdown')) {
            const dropdown = event.target;
            const taskId = parseInt(dropdown.getAttribute('data-id'));
            const selectedValue = dropdown.value;
            const taskElement = dropdown.closest('li');
            if (selectedValue) {
                let targetBoardList;
                if (['pending', 'in-progress', 'completed'].includes(selectedValue)) {
                    targetBoardList = document.querySelector(`#${selectedValue}-board .board-content .list`);
                } else {
                    targetBoardList = document.querySelector(`#${selectedValue.replace(/\s+/g, '-').toLowerCase()}-board .board-content .list`);
                }
                if (targetBoardList) {
                    targetBoardList.appendChild(taskElement);
                    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                    tasks.forEach(task => {
                        if (task.id === taskId) {
                            task.status = selectedValue;
                        }
                    });
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                } else {
                    console.error(`Board with id "${selectedValue}-board" not found.`);
                }
            }
        }
    });

    document.querySelectorAll(".modal .close").forEach(closeBtn => {
        closeBtn.addEventListener("click", () => {
            closeBtn.closest(".modal").style.display = "none";
        });
    });
});

function exitPage() {
    window.close();
}

searchInput.addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase().trim(); // Get the search query and trim whitespace

    if (searchQuery === '') {
        // Show all boards and tasks
        const boardColumns = document.querySelectorAll('.col-xl-4.col-sm-6');
        boardColumns.forEach(boardColumn => {
            boardColumn.style.display = 'block';
        });
        const tasks = document.querySelectorAll('.task');
        tasks.forEach(task => {
            task.closest('li').style.display = 'block';
        });
        // Remove any existing no results message
        const existingNoResultsMessage = document.querySelector('.no-results-message');
        if (existingNoResultsMessage) {
            existingNoResultsMessage.remove();
        }
        return;
    }

    // Hide all board columns and tasks initially
    const boardColumns = document.querySelectorAll('.col-xl-4.col-sm-6');
    boardColumns.forEach(boardColumn => {
        boardColumn.style.display = 'none';
    });

    // Remove any existing no results message
    const existingNoResultsMessage = document.querySelector('.no-results-message');
    if (existingNoResultsMessage) {
        existingNoResultsMessage.remove();
    }

    // If search is empty, show all boards and tasks
    if (searchQuery === '') {
        boardColumns.forEach(boardColumn => {
            boardColumn.style.display = 'block';
        });
        return;
    }

    // Track if any matches are found
    let hasMatches = false;

    // Iterate through each board
    boardColumns.forEach(boardColumn => {
        // Find tasks within this board that match the search query
        const tasksInBoard = boardColumn.querySelectorAll('.task');
        let boardHasMatch = false;

        tasksInBoard.forEach(taskElement => {
            // Prepare task content for flexible searching
            const taskName = taskElement.querySelector('h3').textContent.toLowerCase()
                .replace(/\s+/g, '')   // Remove all spaces
                .replace(/-/g, '');    // Remove hyphens
            const taskDescription = taskElement.querySelector('.task-content').textContent.toLowerCase()
                .replace(/\s+/g, '')   // Remove all spaces
                .replace(/-/g, '');    // Remove hyphens
            const taskPriority = taskElement.querySelector('.task-content').textContent.toLowerCase()
                .replace(/\s+/g, '')   // Remove all spaces
                .replace(/-/g, '');    // Remove hyphens
            const taskLowContent = taskElement.querySelector('.task-content').textContent.toLowerCase()
                .replace(/\s+/g, '')   // Remove all spaces
                .replace(/-/g, '');    // Remove hyphens
            
            // Prepare search query
            const searchQueryProcessed = searchQuery
                .replace(/\s+/g, '')   // Remove all spaces
                .replace(/-/g, '');    // Remove hyphens
            
            // Check if task matches the search query
            const matchesSearch = 
                taskName.includes(searchQueryProcessed) || 
                taskDescription.includes(searchQueryProcessed) || 
                taskPriority.includes(searchQueryProcessed) || 
                taskLowContent.includes(searchQueryProcessed);
            
            if (matchesSearch) {
                // Show matching task
                taskElement.closest('li').style.display = 'block';
                boardHasMatch = true;
                hasMatches = true;
            } else {
                // Hide non-matching tasks
                taskElement.closest('li').style.display = 'none';
            }
        });

        // Show the board only if it has matching tasks
        if (boardHasMatch) {
            boardColumn.style.display = 'block';
        }
    });

    // If no matches found, create and display a no results message
    if (!hasMatches) {
        const dashboardElement = document.querySelector('.dashboard .row');
        const noResultsMessage = document.createElement('div');
        noResultsMessage.classList.add('no-results-message');
        noResultsMessage.style.cssText = `
            width: 100%;
            text-align: center;
            padding: 20px;
            background-color: #f8d7da;
            color: #721c24;
            border-radius: 5px;
            margin-top: 20px;
        `;
        noResultsMessage.innerHTML = `
            <h3>No Tasks Found</h3>
            <p>Your search for "${searchQuery}" did not match any tasks.</p>
            <p>Try different keywords or check your spelling.</p>
        `;
        
        // Insert the message after the dashboard row
        dashboardElement.insertAdjacentElement('afterend', noResultsMessage);
    }
});



function editTask(iconElement) {
    const taskId = parseInt(iconElement.getAttribute('data-id'));
    const taskElement = iconElement.closest('li');
    const taskName = taskElement.querySelector('h3').textContent;
    const taskDescription = taskElement.querySelector('.task-content').textContent;

    const taskData = {
        id: taskId,
        name: taskName,
        description: taskDescription
    };

    localStorage.setItem('taskToUpdate', JSON.stringify(taskData));
    window.location.href = 'AddTask.html';
}

function deleteTask(iconElement) {
    const taskId = parseInt(iconElement.getAttribute('data-id'));
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    document.dispatchEvent(new Event('DOMContentLoaded'));
}

function deleteTaskFromLocalStorage(taskElement) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(task => task.name === taskElement.querySelector('h3').textContent);
    if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

document.querySelectorAll(".list-inline li a").forEach(link => {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        const filterType = this.querySelector("span:nth-child(2)").textContent.trim().toLowerCase().replace(/\s+/g, "-");
        document.querySelectorAll(".col-xl-4.col-sm-6").forEach(board => {
            if (board.id === `${filterType}-board`) {
                board.style.display = "block";
            } else {
                board.style.display = "none";
            }
        });
    });
});

document.querySelectorAll(".status-dropdown").forEach(dropdown => {
    dropdown.addEventListener("change", function () {
        const selectedStatus = this.value;
        const taskElement = this.closest(".task");
        if (taskElement) {
            const targetBoard = document.querySelector(`#${selectedStatus}-board .board-content .list`);
            if (targetBoard) {
                targetBoard.appendChild(taskElement);
            } else {
                console.error(`No board found for status: ${selectedStatus}`);
            }
        }
    });
});



















document.addEventListener('DOMContentLoaded', () => {
    // Retrieve tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Target the boards
    const inProgressBoard = document.querySelector('.board.red .board-content .list');
    const pendingBoard = document.querySelector('.board.yellow .board-content .list');
    const completedBoard = document.querySelector('.board.green .board-content .list');

    const inProgressCountElement = document.querySelector('.board.red header h4 span');
    const pendingCountElement = document.querySelector('.board.yellow header h4 span');
    const completedCountElement = document.querySelector('.board.green header h4 span');

    const searchInput = document.querySelector('#search'); // Assuming you have an input field with id="search-input"

    // Function to load all boards (predefined and new ones) from localStorage
    function loadAllBoards() {
        const predefinedBoards = ['pending', 'in-progress', 'completed'];
        const customBoards = JSON.parse(localStorage.getItem('boards')) || [];
        return [...predefinedBoards, ...customBoards.map(board => board.replace(/\s+/g, '-').toLowerCase())];
    }

    // Function to render tasks to the board
    function renderTasks(filteredTasks = tasks) {
        // Clear the board content before appending
        inProgressBoard.innerHTML = '';
        pendingBoard.innerHTML = '';
        completedBoard.innerHTML = '';

        // Loop through the filtered tasks and append them to the corresponding board
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('li');
            taskElement.innerHTML = `
                <div class="task ${task.status}">
                    <header>
                        <h3>${task.name}</h3>
                        <span class="task-actions">
                            <span class="icon flaticon-edit" onclick="editTask(this)" data-id="${task.id}"></span>
                        </span>
                    </header>
                    <header>
                        <span class="task-actions">
                            <span class="icon flaticon-minus" onclick="deleteTask(this)" data-id="${task.id}"></span>
                        </span>
                    </header>
                    <div class="task-content">
                        ${task.description}
                    </div>
                    <div class="task-content">
                        Due Date: ${task.dueDate}
                    </div>
                    <div class="task-content">
                        Priority: ${task.priority}
                    </div>
                    <select class="status-dropdown" data-id="${task.id}">
                        ${generateDropdownOptions(task.status)}
                    </select>
                </div>
            `;

            // Append the task to the corresponding board
            if (task.status === 'pending') {
                pendingBoard.appendChild(taskElement);
            } else if (task.status === 'in-progress') {
                inProgressBoard.appendChild(taskElement);
            } else if (task.status === 'completed') {
                completedBoard.appendChild(taskElement);
            }
        });

        // Update the task counts
        updateTaskCounts(filteredTasks);
    }

    // Function to generate options for the dropdown dynamically
    function generateDropdownOptions(currentStatus) {
        const allBoards = loadAllBoards();
        return allBoards.map(board => {
            const displayName = board.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            return `<option value="${board}" ${currentStatus === board ? 'selected' : ''}>${displayName}</option>`;
        }).join('');
    }

    // Function to update the task counts in the header of each board
    function updateTaskCounts(filteredTasks) {
        const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
        const pendingTasks = filteredTasks.filter(task => task.status === 'pending');
        const completedTasks = filteredTasks.filter(task => task.status === 'completed');

        inProgressCountElement.textContent = `(${inProgressTasks.length})`;
        pendingCountElement.textContent = `(${pendingTasks.length})`;
        completedCountElement.textContent = `(${completedTasks.length})`;
    }

    // Initially render all tasks
    renderTasks();

    // Listen for changes in the status dropdown and move tasks accordingly
    document.addEventListener("change", (event) => {
        if (event.target.classList.contains("status-dropdown")) {
            const dropdown = event.target;
            const taskId = parseInt(dropdown.getAttribute('data-id')); // Get the task ID
            const selectedStatus = dropdown.value; // Get selected value

            // Update the task status in localStorage
            tasks.forEach(task => {
                if (task.id === taskId) {
                    task.status = selectedStatus; // Update the status
                }
            });

            // Save the updated tasks to localStorage
            localStorage.setItem('tasks', JSON.stringify(tasks));

            // Move the task to the correct board without refreshing the page
            const taskElement = dropdown.closest('.task').parentNode; // Get the task element
            taskElement.remove(); // Remove task from current board

            // Append the task to the new board
            if (selectedStatus === 'pending') {
                pendingBoard.appendChild(taskElement);
            } else if (selectedStatus === 'in-progress') {
                inProgressBoard.appendChild(taskElement);
            } else if (selectedStatus === 'completed') {
                completedBoard.appendChild(taskElement);
            }

            // Re-render task counts to reflect the change
            updateTaskCounts(tasks);
        }
    });
});
