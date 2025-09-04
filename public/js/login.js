document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login-btn")
  const usernameInput = document.getElementById("username-input")
  const errorMessage = document.getElementById("error-text")

  // Modal elements
  const loginErrorModal = document.getElementById("login-error-modal")
  const loginErrorModalTitle = document.getElementById(
    "login-error-modal-title"
  )
  const loginErrorModalMessage = document.getElementById(
    "login-error-modal-message"
  )
  const closeLoginErrorModalBtn = document.getElementById(
    "close-login-error-modal-btn"
  )
  const okLoginErrorModalBtn = document.getElementById(
    "ok-login-error-modal-btn"
  )

  // Function to show login error modal
  function showLoginErrorModal(title, message) {
    loginErrorModalTitle.textContent = title
    loginErrorModalMessage.textContent = message
    loginErrorModal.classList.add("visible")
  }

  // Function to close login error modal
  function closeLoginErrorModal() {
    loginErrorModal.classList.remove("visible")
  }

  // Event listeners for modal close buttons
  closeLoginErrorModalBtn.addEventListener("click", closeLoginErrorModal)
  okLoginErrorModalBtn.addEventListener("click", closeLoginErrorModal)

  // Close modal when clicking outside of it
  loginErrorModal.addEventListener("click", (e) => {
    if (e.target === loginErrorModal) {
      closeLoginErrorModal()
    }
  })

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
      .then((response) => {
        if (response.ok) {
          return response.json()
        } else {
          // Handle non-200 status codes
          return response.json().then((data) => {
            throw new Error(data.message || "Login failed")
          })
        }
      })
      .then((data) => {
        if (data.status === "success") {
          // If login is successful, save username in localStorage
          localStorage.setItem("loggedInUser", username)
          // Redirect to the main app page
          window.location.href = "/consistency.html"
        } else {
          // Show modal for invalid username
          showLoginErrorModal("Login Error", data.message)
          errorMessage.textContent = data.message
        }
      })
      .catch((error) => {
        console.error("Login error:", error)
        // Show modal for any login errors
        showLoginErrorModal(
          "Login Error",
          error.message || "An error occurred. Please try again."
        )
        errorMessage.textContent =
          error.message || "An error occurred. Please try again."
      })
  })
})
