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
    link.addEventListener("click", function(event) {
        document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));
        event.currentTarget.classList.add("active");
    });
});


// Task manager object to store tasks
const taskManager = {
    tasks: JSON.parse(localStorage.getItem("tasks")) || []
};

function saveTasks() {
    // console.log("Saving tasks:", taskManager.tasks);
    localStorage.setItem("tasks", JSON.stringify(taskManager.tasks));
}

// Function to add task and update existing one
function addTask() {
    document.querySelector("[data-bs-toggle='modal']").addEventListener("click", function() {
        document.getElementById("taskId").value = "";
    });
    const taskId = document.getElementById("taskId").value;
    const name = document.getElementById("taskName").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value;

    if (!name || !dueDate || !category) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Information',
            text: 'Task Name, Due Date, Priority, and Category are required'
        });
        return;
    }
    
    if (taskId) {
        // Update existing task
        const task = taskManager.tasks.find(task => task.id === parseInt(taskId));
        if (task) {
            task.name = name;
            task.description = description;
            task.dueDate = dueDate;
            task.priority = priority;
            task.category = category;
        }
    } else {
        // Add new Task
        const newTask = {
            id: Date.now(),
            name,
            description,
            dueDate,
            priority,
            category,
            status: "pending",
            // createdAt: new Date().toISOString()
        };
        // Add the new task to the task list
        taskManager.tasks.push(newTask);
    }

    saveTasks();
    filterTasks();
    updateTaskList()
    updateDashboard();
    document.getElementById("taskForm").reset();

    // Close modal
    let modal = bootstrap.Modal.getInstance(document.getElementById("addTaskModal"));
    modal.hide();

    //Show sucess message
    Swal.fire({
        icon: 'success',
        title: taskId ? 'Task Updated' : 'Task Added',
        showConfirmButton: false,
        timer: 1500
    });
}

//Pagination variable
let currentPage =1;
const tasksPerPage = 5;

// Function to update task list in the UI
function updateTaskList(tasks = taskManager.tasks) {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        const noTaskMessage = document.createElement("div");
        noTaskMessage.classList.add("alert", "alert-info", "text-center")
        noTaskMessage.textContent = "No tasks added. Please add a task.";
        taskList.appendChild(noTaskMessage);
        return;
    }

    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    paginatedTasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.classList.add("list-group-item");

        //Check if the task is overdue
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        if (dueDate < today) {
            taskItem.classList.add("overdue-task")
        }
        
          // strike through completed task
          if (task.status === "completed") {
            taskItem.classList.add("completed-task","text-muted", "bg-light");
        }

        let priorityClass = "";
        switch (task.priority) {
            case "low":
                priorityClass = "priority-low";
                break;
            case "medium":
                priorityClass = "priority-medium";
                break;
            case "high":
                priorityClass = "priority-high";
                break;
            default:
                priorityClass = "";
            
        }

        taskItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class = "top">
                     <strong>${task.name}</strong>
                     <p>${task.description}</p>
                <div>
                    <span class="badge bg-info">${task.category}</span>
                    <span class= "badge ${priorityClass}">Priority: ${task.priority}</span> <br>
                    <small>Due: ${task.dueDate}</small> 
                </div>
                </div>
               
              <div class="d-flex justify-content-end">
                <button class="btn btn-sm btn-warning me-2" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-sm btn-danger me-2" onclick="deleteTask(${task.id})">Delete</button>
                <button class="btn btn-sm btn-info" onclick="toggleCompletion(${task.id})">
                    ${task.status === "completed" ? "Undo" : "Completed"} 
                </button>
             </div>

            </div>
        `;
        taskList.appendChild(taskItem);
    });

    updatePaginationControls(tasks.length);
}

function updatePaginationControls(totalTasks) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalTasks / tasksPerPage);

    if (totalPages <= 1) return;

    const paginationList = document.createElement("ul");
    paginationList.className = "pagination justify-content-center";

    const createPageItem = (pageNumber, isActive) => {
        const pageItem = document.createElement("li");
        pageItem.className = "page-item" + (isActive ? " active" : "");
        const pageLink = document.createElement("a");
        pageLink.className = "page-link";
        pageLink.href = "#";
        pageLink.innerText = pageNumber;
        pageLink.addEventListener("click", () => {
            currentPage = pageNumber;
            filterTasks();
        });
        pageItem.appendChild(pageLink);
        return pageItem;
    };

    // Previous button
    const prevItem = document.createElement("li");
    prevItem.className = "page-item" + (currentPage === 1 ? " disabled" : "");
    const prevLink = document.createElement("a");
    prevLink.className = "page-link";
    prevLink.href = "#";
    prevLink.innerText = "Previous";
    prevLink.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            filterTasks();
        }
    });
    prevItem.appendChild(prevLink);
    paginationList.appendChild(prevItem);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = createPageItem(i, i === currentPage);
        paginationList.appendChild(pageItem);
    }

    // Next button
    const nextItem = document.createElement("li");
    nextItem.className = "page-item" + (currentPage === totalPages ? " disabled" : "");
    const nextLink = document.createElement("a");
    nextLink.className = "page-link";
    nextLink.href = "#";
    nextLink.innerText = "Next";
    nextLink.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            filterTasks();
        }
    });
    nextItem.appendChild(nextLink);
    paginationList.appendChild(nextItem);

    paginationContainer.appendChild(paginationList);
}


// Function to toggle completion status
function toggleCompletion(taskId) {
    const task = taskManager.tasks.find(task => task.id === taskId);
    if (!task) return;

    task.status = task.status === "completed" ? "pending" : "completed";
    saveTasks();
    filterTasks();
    updateDashboard();
}

// Function to delete task
function deleteTask(taskId) {
    if(confirm ("Are you sure you want to delete this task?")) {
        taskManager.tasks = taskManager.tasks.filter((task) => task.id !== taskId);
        saveTasks();
        filterTasks();
        updateDashboard();
    }
}

// Function to edit task
function editTask(taskId) {
    const task = taskManager.tasks.find((task) => task.id === taskId);
    if (!task) return;

    document.getElementById("taskId").value = task.id;
    document.getElementById("taskName").value = task.name;
    document.getElementById("taskDescription").value = task.description;
    document.getElementById("dueDate").value = task.dueDate;
    document.getElementById("priority").value = task.priority;
    document.getElementById("category").value = task.category;

    let modal = new bootstrap.Modal(document.getElementById("addTaskModal"));
    modal.show();
    document.getElementById("taskForm").addEventListener("submit", function(e) {
        e.preventDefault();
        updateTask();
    });
}

function updateDashboard(){
    const total = taskManager.tasks.length;
    const pending = taskManager.tasks.filter(task => task.status === "pending").length;
    const completed = taskManager.tasks.filter(task => task.status === "completed").length;

    document.getElementById("totalTasksCount").innerText = total;
    document.getElementById("pendingTasksCount").innerText = pending;
    document.getElementById("completedTasksCount").innerText = completed;

    // Count tasks by category
    const work = taskManager.tasks.filter(task => task.category.toLowerCase() === "work").length;
    const personal = taskManager.tasks.filter(task => task.category.toLowerCase() === "personal").length;
    const shopping = taskManager.tasks.filter(task => task.category.toLowerCase() === "shopping").length;



    updatePieChart(pending, completed);
    updateDonutChart(work, personal, shopping);
}

// Initialize Pie Chart
let pieChart;
function updatePieChart(pending, completed) {
    const ctx = document.getElementById("taskPieChart").getContext("2d");
    if (pieChart) {
        pieChart.destroy();
    }
    pieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Pending", "Completed"],
            datasets: [{
                data: [pending, completed],
                backgroundColor: ["#FFC107", "#28A745"],
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

let donutChart;
function updateDonutChart(work, personal, shoping) {
    const ctx = document.getElementById("categoryDonutChart").getContext("2d");
    if (donutChart) {
        donutChart.destroy();
    }
    donutChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Work", "Personal", "Shoping"],
            datasets: [{
                data: [work, personal, shoping],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}


// Event Listeners
window.onload = () => {
    document.getElementById("filterAll").classList.add("active");
    filterTasks();
    updateDashboard();
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
        tasks = tasks.filter(task => 
            task.name.toLowerCase().includes(search) || 
            task.description.toLowerCase().includes(search)
        );
    }

    if (priority) {
        tasks = tasks.filter(task => task.priority === priority);
    }

    if (category) {
        tasks = tasks.filter(task =>
             task.category.toLowerCase() === category.toLowerCase());
    }

    if (selectedStatus !== "all") {
        if (selectedStatus === "pending" || selectedStatus === "completed") {
            tasks = tasks.filter(task => task.status === selectedStatus);
        }
    }

    if (sort === "dueDate") {
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sort === "priority") {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else if (sort === "name") {
        tasks.sort((a, b) => a.name.localeCompare(b.name));
    }

    updateTaskList(tasks);
    // updateDashboard();
}

// Submit Task
document.getElementById("taskForm").addEventListener("submit", function(e) {
    e.preventDefault();
    addTask();
});

// Initial Load
document.addEventListener("DOMContentLoaded", filterTasks);


