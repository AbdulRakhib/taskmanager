document.addEventListener('DOMContentLoaded', () => {
    const newBoardButton = document.querySelector('.btn-blue');
    const dashboard = document.querySelector('.dashboard .row');
    const modal = document.getElementById('boardNameModal');
    const closeBtn = document.querySelector('.modal .close');
    const createBoardButton = document.getElementById('createBoardButton');
    const boardNameInput = document.getElementById('boardNameInput');
    const searchInput = document.querySelector('#search');

    // Predefined boards
    const predefinedBoards = ['pending', 'in-progress', 'completed'];
    let allTasks = []; // Will hold all tasks from the server

    // Fetch tasks from backend and render
    fetch('/tasks')
        .then(response => response.json())
        .then(data => {
            allTasks = data;
            renderTasks(allTasks);

            // Add event listeners to filter links after tasks are loaded
            document.querySelectorAll(".list-inline li a").forEach(link => {
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    const filterText = link.querySelector("span:nth-child(2)").textContent.trim().toLowerCase();

                    let filteredTasks;
                    if (filterText === "all") {
                        filteredTasks = allTasks;
                    } else if (filterText === "in progress") {
                        filteredTasks = allTasks.filter(task => task.status === "in-progress");
                    } else if (filterText === "pending") {
                        filteredTasks = allTasks.filter(task => task.status === "pending");
                    } else if (filterText === "completed") {
                        filteredTasks = allTasks.filter(task => task.status === "completed");
                    } else {
                        filteredTasks = allTasks;
                    }

                    renderTasks(filteredTasks);
                });
            });
        })
        .catch(error => console.error('Error fetching tasks:', error));

    function renderTasks(tasks) {
        // Clear existing tasks from predefined boards
        predefinedBoards.forEach(board => {
            const boardList = document.querySelector(`#${board}-board .board-content .list`);
            if (boardList) boardList.innerHTML = '';
        });

        // Clear tasks from custom boards
        const boards = getBoardsFromLocalStorage();
        boards.forEach(boardName => {
            const sanitized = boardName.replace(/\s+/g, '-').toLowerCase();
            const boardList = document.querySelector(`#${sanitized}-board .board-content .list`);
            if (boardList) boardList.innerHTML = '';
        });

        // Populate tasks
        tasks.forEach(task => {
            const boardId = `${task.status}-board`;
            const boardList = document.querySelector(`#${boardId} .board-content .list`);
            if (boardList) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="task ${task.status}" id="tasks">
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
                        <div class="task-content">${task.description}</div>
                        <div class="task-due-date">Due date: ${task.due_date}</div>
                        <div class="task-content-priority">Priority: ${task.priority}</div>
                        <select class="status-dropdown" data-id="${task.id}">
                            ${generateDropdownOptions(task.status)}
                        </select>
                    </div>
                `;
                boardList.appendChild(li);
            }
        });

        updateTaskCounts(tasks);
    }

    function generateDropdownOptions(currentStatus) {
        const boards = getBoardsFromLocalStorage();
        const allBoards = [...predefinedBoards, ...boards];
        return allBoards.map(board => {
            const sanitized = board.replace(/\s+/g, '-').toLowerCase();
            const selected = (sanitized === currentStatus) ? 'selected' : '';
            const displayName = board.charAt(0).toUpperCase() + board.slice(1);
            return `<option value="${sanitized}" ${selected}>${displayName}</option>`;
        }).join('');
    }

    function updateTaskCounts(tasks) {
        const pendingCount = tasks.filter(t => t.status === 'pending').length;
        const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
        const completedCount = tasks.filter(t => t.status === 'completed').length;

        document.querySelector('#pending-board h4 span').textContent = `(${pendingCount})`;
        document.querySelector('#in-progress-board h4 span').textContent = `(${inProgressCount})`;
        document.querySelector('#completed-board h4 span').textContent = `(${completedCount})`;

        // Update counts for custom boards
        const boards = getBoardsFromLocalStorage();
        boards.forEach(board => {
            const sanitized = board.replace(/\s+/g, '-').toLowerCase();
            const boardCount = tasks.filter(t => t.status === sanitized).length;
            const boardCountElement = document.querySelector(`#${sanitized}-board h4 span`);
            if (boardCountElement) {
                boardCountElement.textContent = `(${boardCount})`;
            }
        });
    }

    // Handle status change
    document.addEventListener('change', event => {
        if (event.target.classList.contains('status-dropdown')) {
            const dropdown = event.target;
            const taskId = parseInt(dropdown.getAttribute('data-id'));
            const newStatus = dropdown.value;

            // Find task in allTasks
            const task = allTasks.find(t => t.id === taskId);
            if (!task) return;

            // Update task on backend
            const updatedTask = {
                name: task.name,
                description: task.description,
                due_date: task.due_date,
                priority: task.priority,
                status: newStatus
            };

            fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatedTask)
            })
            .then(response => response.json())
            .then(data => {
                // Update local array and re-render
                const idx = allTasks.findIndex(t => t.id === taskId);
                if (idx !== -1) {
                    allTasks[idx] = data;
                }
                renderTasks(allTasks);
            })
            .catch(error => console.error('Error updating task:', error));
        }
    });

    // Search functionality
    searchInput.addEventListener('input', function () {
        const searchQuery = this.value.toLowerCase().trim();
        if (searchQuery === '') {
            // Show all tasks
            renderTasks(allTasks);
            removeNoResultsMessage();
            return;
        }

        // Filter tasks by search query
        const filteredTasks = allTasks.filter(task => {
            const name = task.name.toLowerCase();
            const desc = task.description.toLowerCase();
            const priority = task.priority.toLowerCase();
            const dueDate = (task.due_date || '').toLowerCase();
            return (
                name.includes(searchQuery) || 
                desc.includes(searchQuery) || 
                priority.includes(searchQuery) || 
                dueDate.includes(searchQuery)
            );
        });

        if (filteredTasks.length === 0) {
            clearBoards();
            showNoResultsMessage(searchQuery);
        } else {
            renderTasks(filteredTasks);
            removeNoResultsMessage();
        }
    });

    function clearBoards() {
        const boardColumns = document.querySelectorAll('.col-xl-4.col-sm-6');
        boardColumns.forEach(boardColumn => {
            const list = boardColumn.querySelector('.list');
            if (list) list.innerHTML = '';
        });
    }

    function showNoResultsMessage(query) {
        removeNoResultsMessage();
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
            <p>Your search for "${query}" did not match any tasks.</p>
        `;
        dashboardElement.insertAdjacentElement('afterend', noResultsMessage);
    }

    function removeNoResultsMessage() {
        const existing = document.querySelector('.no-results-message');
        if (existing) existing.remove();
    }

    // Boards handling
    renderNewBoards();
    loadBoards();

    function getBoardsFromLocalStorage() {
        return JSON.parse(localStorage.getItem('boards')) || [];
    }

    function renderNewBoards() {
        const boards = getBoardsFromLocalStorage();
        const filteredBoards = boards.filter(board => !['Pending', 'In Progress', 'Completed'].includes(board));

        filteredBoards.forEach(boardName => {
            const boardId = `${boardName.replace(/\s+/g, '-').toLowerCase()}-board`;
            if (!document.getElementById(boardId)) {
                const newBoard = document.createElement('div');
                newBoard.classList.add('col-xl-4', 'col-sm-6');
                newBoard.id = boardId;
                newBoard.innerHTML = `
                    <article class="board" data-board-name="${boardName}">
                        <header>
                            <h4>${boardName} <span>(0)</span></h4>
                            <span class="icon flaticon-minus" data-board-name="${boardName}"></span>
                        </header>
                        <div class="board-content">
                            <ul class="list"></ul>
                        </div>
                    </article>
                `;
                dashboard.appendChild(newBoard);
            }
        });

        document.querySelectorAll('.icon.flaticon-minus').forEach(icon => {
            icon.addEventListener('click', function () {
                const boardName = this.getAttribute('data-board-name');
                let boards = getBoardsFromLocalStorage();
                const updatedBoards = boards.filter(board => board !== boardName);
                localStorage.setItem('boards', JSON.stringify(updatedBoards));
                const boardElement = document.getElementById(`${boardName.replace(/\s+/g, '-').toLowerCase()}-board`);
                if (boardElement) boardElement.remove();
            });
        });
    }

    function loadBoards() {
        // This function can be simplified since tasks are now loaded from the backend.
        // It can remain here if future logic is needed.
    }

    // Modal functionality
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

        let boards = getBoardsFromLocalStorage();
        const boardExists = boards.some(existingBoard => existingBoard.toLowerCase() === boardName.toLowerCase());
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
});

window.editTask = function(iconElement) {
    const taskId = parseInt(iconElement.getAttribute('data-id'));
    fetch(`/tasks/${taskId}`)
        .then(response => response.json())
        .then(task => {
            const taskData = {
                id: task.id,
                name: task.name,
                description: task.description,
                due_date: task.due_date,
                priority: task.priority
            };
            localStorage.setItem('taskToUpdate', JSON.stringify(taskData));
            window.location.href = '/addTask';  
        })
        .catch(error => console.error('Error fetching task for edit:', error));
};


window.deleteTask = function(iconElement) {
    const taskId = parseInt(iconElement.getAttribute('data-id'));
    fetch(`/tasks/${taskId}`, {method: 'DELETE'})
        .then(response => response.json())
        .then(data => {
            console.log('Task deleted:', data);
            // Re-fetch tasks to update UI
            return fetch('/tasks');
        })
        .then(response => response.json())
        .then(data => {
            // Update allTasks and re-render
            allTasks = data;
            renderTasks(allTasks);
        })
        .catch(error => console.error('Error deleting task:', error));
};
