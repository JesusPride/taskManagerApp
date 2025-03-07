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
    tasks: JSON.parse(localStorage.getItem("tasks")) || []
};

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(taskManager.tasks));
}

// Function to add task and update existing one
function addTask() {
    const taskId = document.getElementById("taskId").value;
    const name = document.getElementById("taskName").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const duedate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value;

    if (!name || !duedate || !category) {
        alert ("Task Name, Due Date, and Category are required");
        return;
    }

    if (taskId) {
        // Update existing task
        const task = taskManager.tasks.find(task => task.id == taskId);
        if (task) {
            task.name = name;
            task.description = description;
            task.duedate = duedate;
            task.priority = priority;
            task.category = category;
        }
    } else {
        // Add new Task
        const newTask = {
            id: Date.now(),
            name,
            description,
            duedate,
            priority,
            category,
            status: "pending",
        };
        // Add the new task to the task list
        taskManager.tasks.push(newTask);
    }

    saveTasks();
    filterTasks();
    document.getElementById("taskForm").reset();

    // Close modal
    let modal = bootstrap.Modal.getInstance(document.getElementById("addTaskModal"));
    modal.hide();
}

// Function to update task list in the UI
function updateTaskList(tasks = taskManager.tasks) {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.classList.add("list-group-item");

        taskItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                     <strong>${task.name}</strong>
                     <p>${task.description}</p>
                <div>
                    <span class="badge bg-info">${task.category}</span>
                    <span class= "badge bg-warning">Priority: ${task.priority}</span> <br>
                    <small>Due: ${task.duedate}</small> 
                </div>
                </div>
               
              <div class="d-flex justify-content-end">
                <button class="btn btn-sm btn-secondary me-2" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-sm btn-danger me-2" onclick="deleteTask(${task.id})">Delete</button>
                <button class="btn btn-sm btn-info" onclick="toggleCompletion(${task.id})">
                    ${task.status === "completed" ? "Undo" : "Completed"} 
                </button>
            </div>

            </div>
        `;
        taskList.appendChild(taskItem);
    });
}

// Function to toggle completion status
function toggleCompletion(taskId) {
    const task = taskManager.tasks.find(task => task.id === taskId);
    if (!task) return;

    task.status = task.status === "completed" ? "pending" : "completed";
    saveTasks();
    filterTasks();
}

// Function to delete task
function deleteTask(taskId) {
    taskManager.tasks = taskManager.tasks.filter((task) => task.id !== taskId);
    saveTasks();
    filterTasks();
}

// Function to edit task
function editTask(taskId) {
    const task = taskManager.tasks.find((task) => task.id === taskId);
    if (!task) return;

    document.getElementById("taskId").value = task.id;
    document.getElementById("taskName").value = task.name;
    document.getElementById("taskDescription").value = task.description;
    document.getElementById("dueDate").value = task.duedate;
    document.getElementById("priority").value = task.priority;
    document.getElementById("category").value = task.category;

    let modal = new bootstrap.Modal(document.getElementById("addTaskModal"));
    modal.show();
}

// Event Listeners
window.onload = () => {
    document.getElementById("filterAll").classList.add("active");
    filterTasks();
};

// Filter Buttons
["filterAll", "filterPending", "filterCompleted"].forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        document.querySelectorAll(".btn-group .btn").forEach(btn => btn.classList.remove("active"));
        document.getElementById(id).classList.add("active");
        filterTasks();
    });
});

// Filter Section Event Listeners
document.getElementById("searchInput").addEventListener("input", filterTasks);
document.getElementById("priorityFilter").addEventListener("change", filterTasks);
document.getElementById("categoryFilter").addEventListener("change", filterTasks);
document.getElementById("sortBy").addEventListener("change", filterTasks);

function filterTasks() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const priority = document.getElementById("priorityFilter").value;
    const category = document.getElementById("categoryFilter").value;
    const sort = document.getElementById("sortBy").value;
    const selectedStatus = document.querySelector(".btn-group .active")?.innerText.toLowerCase() || "all";

    let tasks = [...taskManager.tasks];

    if (search) {
        tasks = tasks.filter(task => task.name.toLowerCase().includes(search) || task.description.toLowerCase().includes(search));
    }

    if (priority) {
        tasks = tasks.filter(task => task.priority === priority);
    }

    if (category) {
        tasks = tasks.filter(task => task.category === category);
    }

    if (selectedStatus !== "all") {
        tasks = tasks.filter(task => task.status === selectedStatus);
    }

    if (sort === "dueDate") {
        tasks.sort((a, b) => new Date(a.duedate) - new Date(b.duedate));
    } else if (sort === "priority") {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sort === "name") {
        tasks.sort((a, b) => a.name.localeCompare(b.name));
    }

    updateTaskList(tasks);
}

// Submit Task
document.getElementById("taskForm").addEventListener("submit", function(e) {
    e.preventDefault();
    addTask();
});

// Initial Load
document.addEventListener("DOMContentLoaded", filterTasks);