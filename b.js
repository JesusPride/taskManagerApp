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
    updateTaskList();
    document.getElementById("taskForm").reset();

    // Close modal
    let modal = bootstrap.Modal.getInstance(document.getElementById("addTaskModal"));
    modal.hide();
}

// Function to update tasklist in the UI
function updateTaskList() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    taskManager.tasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.classList.add("list-group-item");

        taskItem.innerHTML = `
            <strong>${task.name}</strong> - ${task.category} <br>
            <small>Due: ${task.duedate} | Priority: ${task.priority}</small> <br>
            <div class = "d-flex justify-content-end">
                <button class="btn btn-secondary me-2" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-danger me-2" onclick="deleteTask(${task.id})">Delete</button>
                <button class="btn btn-info" onclick="toggleCompletion(${task.id})">
                    ${task.status === "completed" ? "Undo" : "Completed"} 
                </button>
            </div>
        `;

        taskList.appendChild(taskItem);
    });
}

// Function to mark completeed or undo
function toggleCompletion(taskId) {
    const task = taskManager.tasks.find(task => taskId === taskId);
    if (!task) return;

    task.status = task.status === "completed" ? "pending" : "completed";

    saveTasks();
    updateTaskList()
}

// Function to delete task
function deleteTask(taskId) {
    taskManager.tasks = taskManager.tasks.filter((task) => task.id !== taskId);
    saveTasks();
    updateTaskList();
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


document.getElementById("taskForm").addEventListener("submit", function (e) {
    e.preventDefault();
    addTask();
});

// Load tasks when the page loads
document.addEventListener("DOMContentLoaded", updateTaskList);

