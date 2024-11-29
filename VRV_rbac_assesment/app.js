const API_URL = "http://localhost:3000";

// Handle Registration
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;
  const role = document.getElementById("registerRole").value;

  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role }),
  });

  if (response.ok) {
    alert("Registration successful!");
    document.getElementById("registerForm").reset();
  } else {
    alert("Error during registration.");
  }
});

// Handle Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("username", username);
    showWelcomeScreen(username, data.role);
  } else {
    alert("Login failed. Check your credentials.");
  }
});

// Show Welcome Screen
function showWelcomeScreen(username, role) {
  document.querySelector(".welcome").classList.remove("hidden");
  document.getElementById("usernameDisplay").textContent = username;
  document.getElementById("roleDisplay").textContent = role;

  if (role === "Admin") {
    document.getElementById("adminAction").classList.remove("hidden");
  }
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.add("hidden");
}

// Handle Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  alert("Logged out successfully.");
  document.querySelector(".welcome").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
});

// Admin Action
document.getElementById("adminAction").addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (response.ok) {
      const adminLink = document.getElementById("adminLink");
      adminLink.click(); // Trigger the hidden link to open the admin page
    } else {
      alert("Access denied.");
    }
});
