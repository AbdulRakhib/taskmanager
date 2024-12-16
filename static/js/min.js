document.addEventListener('DOMContentLoaded', () => {
    const newBoardButton = document.querySelector('.btn-blue');
    const dashboard = document.querySelector('.dashboard .row');
    const modal = document.getElementById('boardNameModal');
    const closeBtn = document.querySelector('.modal .close');
    const createBoardButton = document.getElementById('createBoardButton');
    const boardNameInput = document.getElementById('boardNameInput');
    const boardSelect = document.getElementById('boardSelect');  // Board select dropdown
    
    // Board select in Add Task form
    function loadBoards() {
        console.log('Board Select Element:', boardSelect); // Log to check if boardSelect is available
        
        if (!boardSelect) {
            console.error("boardSelect element not found!");
            return;  // Exit if the element doesn't exist
        }

        // Get boards from localStorage, or initialize with an empty array if none exist
        let boards = JSON.parse(localStorage.getItem('boards')) || [];
        console.log('Boards:', boards); // Check the boards stored in localStorage

        // If no boards exist, initialize with an empty array in localStorage
        if (boards.length === 0) {
            console.log("No boards found in localStorage, initializing with empty array.");
            localStorage.setItem('boards', JSON.stringify(boards));
        }

        // Clear the current options in the dropdown
        boardSelect.innerHTML = '';

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a Board';
        boardSelect.appendChild(defaultOption);

        // Add boards as options
        boards.forEach(board => {
            const option = document.createElement('option');
            option.value = board; // Store the board name as value
            option.textContent = board; // Display the board name
            boardSelect.appendChild(option);
        });
    }

    // Open the modal when "New Board" button is clicked
    newBoardButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Close the modal when the close button is clicked
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close the modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Create the new board and close the modal
    createBoardButton.addEventListener('click', () => {
        const boardName = boardNameInput.value.trim();

        // Validate board name
        if (!boardName) {
            alert('Board name cannot be empty.');
            return;
        }

        // Clear the input field
        boardNameInput.value = '';

        // Store the new board in localStorage
        let boards = JSON.parse(localStorage.getItem('boards')) || [];
        boards.push(boardName);
        localStorage.setItem('boards', JSON.stringify(boards)); // Store updated list

        // Create the new board in the UI
        const newBoard = document.createElement('div');
        newBoard.classList.add('col-xl-4', 'col-sm-6');
        newBoard.innerHTML = `
            <article class="board" data-board-name="${boardName}">
                <header>
                    <h4>${boardName} <span>(0)</span></h4>
                    <span class="icon flaticon-more-1"></span>
                </header>
                <div class="board-content">
                    <ul class="list">
                        <li>No tasks yet. Add tasks to get started.</li>
                    </ul>
                </div>
            </article>
        `;

        // Append the new board after the existing ones
        dashboard.appendChild(newBoard);

        // Close the modal
        modal.style.display = 'none';

        // Reload the boards dropdown in the Add Task form
        loadBoards();
    });

    // Load boards when the page loads
    loadBoards();
});


document.querySelectorAll(".modal .close").forEach(closeBtn => {
    closeBtn.addEventListener("click", () => {
        closeBtn.closest(".modal").style.display = "none";
    });
});
