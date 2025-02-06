// Initialize charts
let postsBarChart, todoPieChart, postsHistogram;

// API endpoints
const API_BASE = 'https://jsonplaceholder.typicode.com';
const ENDPOINTS = {
    users: `${API_BASE}/users`,
    posts: `${API_BASE}/posts`,
    todos: `${API_BASE}/todos`
};

// Fetch data from API
async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        return [];
    }
}

// Update summary cards
async function updateSummaryCards() {
    const [users, posts, todos] = await Promise.all([
        fetchData(ENDPOINTS.users),
        fetchData(ENDPOINTS.posts),
        fetchData(ENDPOINTS.todos)
    ]);

    const completedTodos = todos.filter(todo => todo.completed).length;

    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalPosts').textContent = posts.length;
    document.getElementById('totalTodos').textContent = todos.length;
    document.getElementById('completedTodos').textContent = completedTodos;

    // Update progress bars
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars[0].style.width = '100%';
    progressBars[1].style.width = `${(posts.length / (users.length * 10)) * 100}%`;
    progressBars[2].style.width = `${(todos.length / (users.length * 20)) * 100}%`;
    progressBars[3].style.width = `${(completedTodos / todos.length) * 100}%`;

    return { users, posts, todos };
}

// Create Posts Bar Chart
function createPostsBarChart(users, posts) {
    const ctx = document.getElementById('postsBarChart').getContext('2d');
    
    const postsPerUser = users.map(user => ({
        username: user.username,
        postCount: posts.filter(post => post.userId === user.id).length
    }));

    if (postsBarChart) {
        postsBarChart.destroy();
    }

    postsBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: postsPerUser.map(user => user.username),
            datasets: [{
                label: 'Number of Posts',
                data: postsPerUser.map(user => user.postCount),
                backgroundColor: '#4361ee',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Create Todo Pie Chart
function createTodoPieChart(todos) {
    const ctx = document.getElementById('todoPieChart').getContext('2d');
    
    const completed = todos.filter(todo => todo.completed).length;
    const pending = todos.length - completed;

    if (todoPieChart) {
        todoPieChart.destroy();
    }

    todoPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [completed, pending],
                backgroundColor: ['#2ec4b6', '#ef476f'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create Posts Histogram
function createPostsHistogram(posts) {
    const ctx = document.getElementById('postsHistogram').getContext('2d');
    
    // Calculate word count for each post
    const wordCounts = posts.map(post => post.body.split(/\s+/).length);
    
    // Create bins for histogram
    const binSize = 5;
    const bins = {};
    wordCounts.forEach(count => {
        const bin = Math.floor(count / binSize) * binSize;
        bins[bin] = (bins[bin] || 0) + 1;
    });

    if (postsHistogram) {
        postsHistogram.destroy();
    }

    postsHistogram = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(bins).map(bin => `${bin}-${parseInt(bin) + binSize} words`),
            datasets: [{
                label: 'Number of Posts',
                data: Object.values(bins),
                backgroundColor: '#4cc9f0',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Generate updates list
function generateUpdatesList(users, posts, todos) {
    const updatesList = document.getElementById('updatesList');
    updatesList.innerHTML = '';

    const updates = [
        {
            title: `${users.length} Users Active`,
            icon: 'fa-users',
            color: '#4361ee',
            time: '2 minutes ago'
        },
        {
            title: `${posts.length} Total Posts`,
            icon: 'fa-comments',
            color: '#2ec4b6',
            time: '5 minutes ago'
        },
        {
            title: `${todos.filter(todo => todo.completed).length} Tasks Completed`,
            icon: 'fa-check-circle',
            color: '#4cc9f0',
            time: '10 minutes ago'
        }
    ];

    updates.forEach(update => {
        const updateItem = document.createElement('div');
        updateItem.className = 'update-item';
        updateItem.innerHTML = `
            <div class="update-icon" style="background-color: ${update.color}">
                <i class="fas ${update.icon}"></i>
            </div>
            <div class="update-content">
                <div class="update-title">${update.title}</div>
                <div class="update-time">${update.time}</div>
            </div>
        `;
        updatesList.appendChild(updateItem);
    });
}

// New function to populate user details table
async function populateUserDetails(users, posts, todos) {
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = '';

    users.forEach(user => {
        const userPosts = posts.filter(post => post.userId === user.id);
        const userTodos = todos.filter(todo => todo.userId === user.id);
        const completedTodos = userTodos.filter(todo => todo.completed).length;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-circle" style="background-color: ${getRandomColor()}">${user.name.charAt(0)}</div>
                    <div class="ms-2">${user.name}</div>
                </div>
            </td>
            <td>@${user.username}</td>
            <td>${user.email}</td>
            <td>${user.company.name}</td>
            <td>${user.address.city}</td>
            <td><span class="user-stats posts">${userPosts.length} posts</span></td>
            <td><span class="user-stats todos">${completedTodos}/${userTodos.length} done</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewUserDetails(${user.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="viewUserPosts(${user.id})">
                        <i class="fas fa-comments"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to handle user search
function setupUserSearch() {
    const searchInput = document.getElementById('userSearch');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#userTableBody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Helper function to generate random colors for user avatars
function getRandomColor() {
    const colors = [
        '#4361ee', '#2ec4b6', '#ff9f1c', '#4cc9f0', '#ef476f',
        '#06d6a0', '#118ab2', '#073b4c', '#6d597a', '#b56576'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Placeholder functions for user actions
function viewUserDetails(userId) {
    console.log('View details for user:', userId);
    // Implement user details view functionality
}

function viewUserPosts(userId) {
    console.log('View posts for user:', userId);
    // Implement user posts view functionality
}

// Initialize dashboard
async function initDashboard() {
    const { users, posts, todos } = await updateSummaryCards();
    createPostsBarChart(users, posts);
    createTodoPieChart(todos);
    createPostsHistogram(posts);
    generateUpdatesList(users, posts, todos);
    populateUserDetails(users, posts, todos);
    setupUserSearch();
}

// Refresh data
async function refreshData() {
    const refreshButton = document.getElementById('refreshData');
    refreshButton.disabled = true;
    refreshButton.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
    
    await initDashboard();
    
    refreshButton.disabled = false;
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    document.getElementById('refreshData').addEventListener('click', refreshData);
});