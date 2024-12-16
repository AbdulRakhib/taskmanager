document.addEventListener('DOMContentLoaded', () => {
    const taskToUpdate = JSON.parse(localStorage.getItem('taskToUpdate'));

    if (taskToUpdate) {
        document.getElementById('task-name').value = taskToUpdate.name;
        document.getElementById('task-desc').value = taskToUpdate.description;
        document.getElementById('task-due-date').value = taskToUpdate.due_date;
        document.getElementById('task-priority').value = taskToUpdate.priority;

        document.getElementById('addTaskButton').style.display = 'none';
        document.getElementById('updateTaskButton').style.display = 'inline-block';
        document.getElementById('cancelButton').style.display = 'inline-block';
    } else {
        document.getElementById('updateTaskButton').style.display = 'none';
    }

    // Add task
    document.getElementById('add-task-form').addEventListener('submit', function (e) {
        if (!taskToUpdate) {
            e.preventDefault();
            const taskData = {
                name: document.getElementById('task-name').value,
                description: document.getElementById('task-desc').value,
                due_date: document.getElementById('task-due-date').value,
                priority: document.getElementById('task-priority').value
            };

            fetch('/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Task added:', data);
                window.location.href = '/'; 
            })
            .catch(error => console.error('Error adding task:', error));
        }
    });

    // Update task
    document.getElementById('updateTaskButton').addEventListener('click', function (e) {
        e.preventDefault();
        if (!taskToUpdate) return;

        const updatedTaskData = {
            name: document.getElementById('task-name').value,
            description: document.getElementById('task-desc').value,
            due_date: document.getElementById('task-due-date').value,
            priority: document.getElementById('task-priority').value
        };

        fetch(`/tasks/${taskToUpdate.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTaskData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task updated:', data);
            localStorage.removeItem('taskToUpdate');
            window.location.href = '/'; 
        })
        .catch(error => console.error('Error updating task:', error));
    });

    // Cancel
    document.getElementById('cancelButton').addEventListener('click', function () {
        localStorage.removeItem('taskToUpdate');
        document.getElementById('task-name').value = '';
        document.getElementById('task-desc').value = '';
        document.getElementById('task-due-date').value = '';
        document.getElementById('task-priority').value = '';

        document.getElementById('addTaskButton').style.display = 'inline-block';
        document.getElementById('updateTaskButton').style.display = 'none';
        document.getElementById('cancelButton').style.display = 'none';
    });
});
