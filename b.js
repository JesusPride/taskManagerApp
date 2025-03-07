// Function to show a selected section and hide others
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    // Show the selected section
    document.getElementById(sectionId).classList.remove('d-none');
}

// Event listener to add "active" class to the clicked navigation link
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function() {
        document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));
        this.classList.add("active");
    });
});

// Task manager object to store tasks
const taskManager = {
    tasks: JSON.parse(localStorage.getItem("tasks") || "[]")
};

//Function to add a new task or update an existing one
function addTask() {
    const taskId = document.getElementById("taskId").value;
    const name = document.getElementById("taskName").value.trim();
    const description = document.getElementById("taskDescription").value;
    const date = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value.trim();

    //Validate required fields
    if (!name || !date || !category) {
        alert("Task Name, Due Date, and Category are required");
        return;
    }

    if (taskId) {
        // Update existing task
        const task = taskManager.tasks.find(task => task.id == taskId);
        if (task) {
            task.name = name;
            task.description = description;
            task.date = date;
            task.priority = priority;
            task.category = category;
        }
    } else {
        // Add new Task
        const newTask = {
            id: Date.now(),
            name,
            description,
            date,
            priority,
            category,
            status: "pending",
            // createdAt: new Date().toISOString()
        };
        // Add the new task to the task list
        taskManager.tasks.push(newTask);
    }

    // Save updated tasks to localStorage
    saveTasks();

    // Update the UI
    updateTaskList();

    // Reset the form
    document.getElementById("taskForm").reset();

    // Close the modal wanna make research on getInstace method
    let modal = bootstrap.Modal.getCreateInstance(document.getElementById("addTaskModal"));
    modal.hide();

    // document.getElementById("taskId").value = "";

}

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(taskManager.tasks));
}

// Function to update the task list in the UI
function updateTaskList() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    taskManager.tasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.classList.add("list-group-item");
        taskItem.innerHTML = `
            <strong>${task.name}</strong> - ${task.category} <br>
            <p>${task.description}</p>
            <small>Due: ${task.date} | Priority: ${task.priority}</small> <br>
            <span class="badge ${task.status === 'completed' ? 'bg-success' : 'bg-warning'}">
                ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            <div class="d-flex justify-content-end mt-2">
                <button class="btn btn-secondary me-2" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-danger me-2" onclick="deleteTask(${task.id})">Delete</button>
                <button class="btn btn-info me-2" onclick="toggleCompletion(${task.id})">${task.status === 'completed' ? 'Undo' : 'Completed'}</button>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
}

// Function to edit a task
function editTask(taskId) {
    const task = taskManager.tasks.find(task => task.id === taskId);
    if (!task) return;

    // Populate the form with task data
    document.getElementById("taskId").value = task.id;
    document.getElementById("taskName").value = task.name;
    document.getElementById("taskDescription").value = task.description;
    document.getElementById("dueDate").value = task.date;
    document.getElementById("priority").value = task.priority;
    document.getElementById("category").value = task.category;

    // Show the modal 
    let modal = new bootstrap.Modal(document.getElementById("addTaskModal"));
    modal.show();
}

// Function to toggle the completion status of a task
function toggleCompletion(taskId) {
    const task = taskManager.tasks.find(task => task.id === taskId);
    if (!task) return;

    // Toggle status
    task.status = task.status === "completed" ? "pending" : "completed";

    saveTasks();
    updateTaskList();
}

// Function to delete a task
function deleteTask(taskId) {
    taskManager.tasks = taskManager.tasks.filter(task => task.id !== taskId);

    saveTasks();
    updateTaskList();
}

// Function to filter tasks based on search, priority, category, and sorting
// function filterTasks() {
//     const searchText = document.getElementById("searchInput").value.toLowerCase();
//     const priorityFilter = document.getElementById("priorityFilter").value;
//     const categoryFilter = document.getElementById("categoryFilter").value;
//     const sortBy = document.getElementById("sortBy").value;

//     let filteredTasks = taskManager.tasks.filter(task => {
//         return (
//             (task.name.toLowerCase().includes(searchText) || task.description.toLowerCase().includes(searchText)) &&
//             (priorityFilter === "" || task.priority === priorityFilter) &&
//             (categoryFilter === "" || task.category.toLowerCase() === categoryFilter)
//         );
//     });

//     // Sorting logic
//     if (sortBy) {
//         filteredTasks.sort((a, b) => {
//             if (sortBy === "dueDate") {
//                 return new Date(a.date) - new Date(b.date);
//             } else if (sortBy === "priority") {
//                 const priorityOrder = { low: 1, medium: 2, high: 3 };
//                 return priorityOrder[a.priority] - priorityOrder[b.priority];
//             } else if (sortBy === "name") {
//                 return a.name.localeCompare(b.name); // Fixed: changed to localeCompare
//             }
//         });
//     }

//     updateFilteredTaskList(filteredTasks);
// }

// Function to load tasks from localStorage and apply filtering
// function loadTasks() {
//     taskManager.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     filterTasks(); // Apply filtering on page load
// }

// Load tasks when the page loads
// window.onload = loadTasks;

// Event Listener for Form Submission
document.getElementById("taskForm").addEventListener("submit", function (event) {
    event.preventDefault();
    addTask();
});

// Load tasks when the page loads
document.addEventListener("DOMContentLoaded", updateTaskList);
