// Function to show a selected section and hide others
function showSection(sectionId) {
 
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
  
    document.getElementById(sectionId).classList.remove('d-none');
}

// Event listener to add "active" class to the clicked navigation link
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function(event) {
        document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));
        event.currentTarget.classList.add("active");
    });
});



const taskManager = {
    // tasks: JSON.parse(localStorage.getItem("tasks")) || []
    getTasks: function(emailAddress){
        const tasks = localStorage.getItem(`tasks-${emailAddress}`);
        return tasks ? JSON.parse(tasks) : [];
    },
    saveTasks: function(emailAddress, tasks){
        localStorage.setItem(`tasks-${emailAddress}`, JSON.stringify(tasks));
    }
};

// function saveTasks() {
    // console.log("Saving tasks:", taskManager.tasks);
    // localStorage.setItem("tasks", JSON.stringify(taskManager.tasks));
// }


function addTask() {
    document.querySelector("[data-bs-toggle='modal']").addEventListener("click", function() {
        document.getElementById("taskId").value = "";
    });
    const emailAddress = JSON.parse(localStorage.getItem("user")).emailAddress;
    const tasks = taskManager.getTasks(emailAddress);
    const taskId = document.getElementById("taskId").value;
    const name = document.getElementById("taskName").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value;

    if (!name || !dueDate || !category || !priority) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Information',
            text: 'Task Name, Due Date, Priority, and Category are required'
        });
        return;
    }
    
    if (taskId) {
        const task = tasks.find(task => task.id === parseInt(taskId));
        if (task) {
            task.name = name;
            task.description = description;
            task.dueDate = dueDate;
            task.priority = priority;
            task.category = category;
        }
    } else {
        const newTask = {
            id: Date.now(),
            name,
            description,
            dueDate,
            priority,
            category,
            status: "pending",
        };
       
        tasks.push(newTask);
    }

    taskManager.saveTasks(emailAddress, tasks)
    // saveTasks();
    filterTasks();
    updateTaskList()
    updateDashboard();
    document.getElementById("taskForm").reset();


    let modal = bootstrap.Modal.getInstance(document.getElementById("addTaskModal"));
    modal.hide();

    
    Swal.fire({
        icon: 'success',
        title: taskId ? 'Task Updated' : 'Task Added',
        showConfirmButton: false,
        timer: 1500
    });
}


let currentPage =1;
const tasksPerPage = 5;


function updateTaskList(tasks = taskManager.getTasks(JSON.parse(localStorage.getItem("user")).emailAddress)) {
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

      
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        if (dueDate < today && task.status !== "completed") {
            taskItem.classList.add("overdue-task")
        }
        
          
          if (task.status === "completed") {
            taskItem.classList.add("completed-task","text-muted", "bg-light");
        }

       
        let priorityClass = "";
        if (task.priority === "low") {
            priorityClass = "priority-low"
        }else if  (task.priority === "medium") {
            priorityClass = "priority-medium"
        }else if(task.priority === "high") {
            priorityClass = "priority-high"
        }

        taskItem.innerHTML = `
            <div class="d-lg-flex justify-content-between align-items-center">
                <div class = "top">
                    <input type="checkbox" ${task.status === "completed" ? "checked" : ""} onchange="toggleCompletion(${task.id})"/>
                     <strong>${task.name}</strong>
                     <p>${task.description}</p>
                <div>
                    <span class="badge bg-info">${task.category}</span>
                    <span class= "badge ${priorityClass}">Priority: ${task.priority}</span> <br>
                    <small>Due: ${task.dueDate}</small> 
                </div>
                </div>
               
              <div class="d-flex buttons  justify-content-lg-end">
                <button class="btn btn-sm btn-warning me-2" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-sm btn-danger me-2" onclick="deleteTask(${task.id})">Delete</button>
                <button class="btn btn-sm btn-info" onclick="toggleCompletion(${task.id})">
                    ${task.status === "completed" ? "Undo" : "Completed"} 
                </button>
             </div>

            </div>
        `;
        taskList.prepend(taskItem);
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

  
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = createPageItem(i, i === currentPage);
        paginationList.appendChild(pageItem);
    }

  
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



function toggleCompletion(taskId) {

    // const checkbox = document.getElementById("check");
    const emailAddress = JSON.parse(localStorage.getItem("user")).emailAddress;
    const tasks = taskManager.getTasks(emailAddress);
    const task = tasks.find(task => task.id === taskId);
    if (!task) return;

    task.status = task.status === "completed" ? "pending" : "completed";
    // checkbox.checked = task.status === "completed",
    // saveTasks();
    taskManager.saveTasks(emailAddress, tasks);
    filterTasks();
    updateDashboard();
}

function deleteTask(taskId) {
    if (taskId) {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to undo this action!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                const emailAddress = JSON.parse(localStorage.getItem("user")).emailAddress;
                let tasks = taskManager.getTasks(emailAddress);
                tasks = tasks.filter(task => task.id !== parseInt(taskId));
                // taskManager.tasks = taskManager.tasks.filter(task => task.id !== parseInt(taskId));
                taskManager.saveTasks(emailAddress, tasks);
                filterTasks();
                updateDashboard();

                
                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "Your task has been deleted.",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    }
}


function editTask(taskId) {
    const emailAddress = JSON.parse(localStorage.getItem("user")).emailAddress;
    const tasks = taskManager.getTasks(emailAddress);
    const task = tasks.find((task) => task.id === taskId);
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
    const emailAddress = JSON.parse(localStorage.getItem("user")).emailAddress;
    const tasks = taskManager.getTasks(emailAddress);
    const total = tasks.length;
    const pending = tasks.filter(task => task.status === "pending").length;
    const completed = tasks.filter(task => task.status === "completed").length;

    document.getElementById("totalTasksCount").innerText = total;
    document.getElementById("pendingTasksCount").innerText = pending;
    document.getElementById("completedTasksCount").innerText = completed;

    const work = tasks.filter(task => task.category.toLowerCase() === "work").length;
    const personal = tasks.filter(task => task.category.toLowerCase() === "personal").length;
    const shopping = tasks.filter(task => task.category.toLowerCase() === "shopping").length;



    updatePieChart(pending, completed);
    updateDonutChart(work, personal, shopping);
}


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
    const user = JSON.parse(localStorage.getItem("user"));
    const fullName = user.fullName;
    const firstName = fullName.split(" ")[0];
    const welcomeMessageElement = document.getElementById("welcome-message");
    welcomeMessageElement.textContent = `Welcome, ${firstName}! \u{1F44B}`;
    welcomeMessageElement.style.color = `blue`;
    welcomeMessageElement.style.fontSize = `25px`
    document.getElementById("filterAll").classList.add("active");
    filterTasks();
    updateDashboard();
};

["filterAll", "filterPending", "filterCompleted"].forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        document.querySelectorAll(".btn-group .btn").forEach(btn => btn.classList.remove("active"));
        document.getElementById(id).classList.add("active");
        filterTasks();
    });
});


document.getElementById("searchInput").addEventListener("input", filterTasks);
document.getElementById("priorityFilter").addEventListener("change", filterTasks);
document.getElementById("categoryFilter").addEventListener("change", filterTasks);
document.getElementById("sortBy").addEventListener("change", filterTasks);

function filterTasks() {
    const emailAddress = JSON.parse(localStorage.getItem("user")).emailAddress;
    const tasks = taskManager.getTasks(emailAddress);
    const search = document.getElementById("searchInput").value.toLowerCase();
    const priority = document.getElementById("priorityFilter").value;
    const category = document.getElementById("categoryFilter").value;
    const sort = document.getElementById("sortBy").value;
    const selectedStatus = document.querySelector(".btn-group .active")?.innerText.toLowerCase() || "all";

    let filteredTasks = [...tasks];

    if (search) {
        filteredTasks = filteredTasks.filter(task => 
            task.name.toLowerCase().includes(search) || 
            task.description.toLowerCase().includes(search)
        );
    }

    if (priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }

    if (category) {
        filteredTasks = filteredTasks.filter(task =>
             task.category.toLowerCase() === category.toLowerCase());
    }

    if (selectedStatus !== "all") {
        if (selectedStatus === "pending" || selectedStatus === "completed") {
            filteredTasks = filteredTasks.filter(task => task.status === selectedStatus);
        }
    }

    if (sort === "dueDate") {
        filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sort === "priority") {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else if (sort === "name") {
        filteredTasks.sort((a, b) => a.name.localeCompare(b.name));
    }

    updateTaskList(filteredTasks);
    // updateDashboard();
}

document.getElementById("taskForm").addEventListener("submit", function(e) {
    e.preventDefault();
    addTask();
});


document.addEventListener("DOMContentLoaded", filterTasks);


