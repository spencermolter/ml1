export function saveData(loggedInUser, appState) {
  fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: loggedInUser, trackerData: appState }),
  })
    .then((response) => response.json())
    .then((data) => console.log("Save successful:", data))
    .catch((error) => console.error("Error saving data:", error))
}

export function logout(loggedInUser) {
  localStorage.removeItem("loggedInUser")
  localStorage.removeItem(`${loggedInUser}_cardStates`)
  window.location.href = "/login.html"
}

export function getTodayString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function calculateTotals(appState) {
  const todayLog = appState.foodLog?.[getTodayString()] || []
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  todayLog.forEach((meal) => {
    meal.foods.forEach((food) => {
      totals.calories += food.calories || 0
      totals.protein += food.protein || 0
      totals.carbs += food.carbs || 0
      totals.fat += food.fat || 0
    })
  })
  return totals
}

export function showAlert(title, message) {
  document.getElementById("alert-modal-title").textContent = title
  document.getElementById("alert-modal-message").innerHTML = message
  document.getElementById("alert-modal").classList.add("visible")
}

export function showConfirm(title, message, yesText = "Yes", noText = "No") {
  document.getElementById("confirm-modal-title").textContent = title
  document.getElementById("confirm-modal-message").textContent = message
  document.getElementById("confirm-yes-btn").textContent = yesText
  document.getElementById("confirm-no-btn").textContent = noText
  document.getElementById("confirm-modal").classList.add("visible")

  return new Promise((resolve) => {
    document.getElementById("confirm-yes-btn").addEventListener(
      "click",
      () => {
        document.getElementById("confirm-modal").classList.remove("visible")
        resolve(true)
      },
      { once: true }
    )

    document.getElementById("confirm-no-btn").addEventListener(
      "click",
      () => {
        document.getElementById("confirm-modal").classList.remove("visible")
        resolve(false)
      },
      { once: true }
    )
  })
}

export async function loadNavbar(loggedInUser) {
  const navPlaceholder = document.getElementById("nav-placeholder")
  if (navPlaceholder) {
    try {
      const response = await fetch("/partials/nav.html")
      const navHTML = await response.text()
      navPlaceholder.innerHTML = navHTML

      // Add logout functionality and username
      document
        .getElementById("logout-btn")
        .addEventListener("click", () => logout(loggedInUser))
      document.getElementById("username-display").textContent = loggedInUser

      // Make the current page's link active
      const currentPage = window.location.pathname
      const navLinks = document.querySelectorAll(".nav-links a")
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === currentPage) {
          link.classList.add("active")
        }
      })
    } catch (error) {
      console.error("Error loading navbar:", error)
    }
  }
}
