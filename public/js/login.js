document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login-btn")
  const usernameInput = document.getElementById("username-input")
  const errorMessage = document.getElementById("error-text") // Corrected ID from "error-message" to "error-text"

  loginButton.addEventListener("click", () => {
    const username = usernameInput.value.trim().toLowerCase()
    if (!username) {
      errorMessage.textContent = "Please enter a username."
      return
    }

    const today = new Date()
    const jsDayIndex = today.getDay() // Sunday = 0, Monday = 1, etc.
    // Adjust to our app's format where Monday = 0
    const currentDayIndex = jsDayIndex === 0 ? 6 : jsDayIndex - 1

    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        currentDayIndex: currentDayIndex,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          // If login is successful, save username in localStorage
          localStorage.setItem("loggedInUser", username)
          // Redirect to the main food log page
          window.location.href = "/consistency.html"
        } else {
          errorMessage.textContent = data.message
        }
      })
      .catch((error) => {
        console.error("Login error:", error)
        errorMessage.textContent = "An error occurred. Please try again."
      })
  })
})
