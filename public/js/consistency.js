import * as Utils from "./utils.js"

document.addEventListener("DOMContentLoaded", () => {
  // --- SETUP ---
  const gymStreakDisplay = document.getElementById("gym-streak-display")
  const dietCounterDisplay = document.getElementById("diet-counter-display")
  const completeDayBtn = document.getElementById("complete-day-btn")
  const completionStatus = document.getElementById("completion-status")
  const dayIndicators = document.querySelectorAll(".day-indicator")

  // --- STATE ---
  let loggedInUser = null
  let appState = {}

  // --- UI & LOGIC FUNCTIONS ---
  function updateUI() {
    if (!appState || !appState.workoutSchedule) return

    gymStreakDisplay.textContent = appState.gymStreak
    dietCounterDisplay.textContent = appState.dietCount

    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1

    dayIndicators.forEach((dayEl, index) => {
      dayEl.className = "day-indicator"
      if (appState.workoutSchedule[index]) {
        dayEl.classList.add("workout-and-diet-day")
      } else {
        dayEl.classList.add("diet-day")
      }
      if (index === dayOfWeek) {
        dayEl.classList.add("current-day")
      }
    })

    updateButtonStates()
  }

  function updateButtonStates() {
    const todayStr = Utils.getTodayString()
    const dayIsComplete = appState.lastCompletionDate === todayStr
    const gymLoggedToday = appState.lastGymLog === todayStr
    const dietLoggedToday = appState.lastDietLog === todayStr

    const canComplete = !dayIsComplete && gymLoggedToday && dietLoggedToday
    completeDayBtn.disabled = !canComplete

    if (canComplete) {
      completeDayBtn.classList.add("active-green")
    } else {
      completeDayBtn.classList.remove("active-green")
    }

    // Update completion status message
    if (dayIsComplete) {
      completionStatus.textContent = "✅ Day Complete"
      completionStatus.classList.add("completion-status")
    } else {
      completionStatus.textContent = ""
      completionStatus.classList.remove("completion-status")
    }
  }

  async function completeDay() {
    const todayStr = Utils.getTodayString()
    const gymLoggedToday = appState.lastGymLog === todayStr
    const dietLoggedToday = appState.lastDietLog === todayStr

    if (!gymLoggedToday || !dietLoggedToday) {
      // This path should ideally not be taken if the button is disabled correctly
      Utils.showAlert(
        "Action Required",
        "Please log both your gym session and diet for today to complete the day."
      )
      return
    }

    // Both are logged, proceed with completion
    appState.gymStreak++
    appState.dietCount++
    appState.lastCompletionDate = todayStr
    Utils.showAlert("Nice Job!", "Day complete! Consistency is key.")

    updateUI()
    Utils.saveData(loggedInUser, appState)
  }

  completeDayBtn.addEventListener("click", completeDay)

  document
    .getElementById("ok-alert-modal-btn")
    .addEventListener("click", () =>
      document.getElementById("alert-modal").classList.remove("visible")
    )
  document
    .getElementById("close-alert-modal-btn")
    .addEventListener("click", () =>
      document.getElementById("alert-modal").classList.remove("visible")
    )

  async function initializeApp() {
    loggedInUser = localStorage.getItem("loggedInUser")
    if (!loggedInUser) {
      window.location.href = "/login.html"
      return
    }
    await Utils.loadNavbar(loggedInUser)
    fetch("/api/data")
      .then((response) => response.json())
      .then((data) => {
        const currentUserData = data.users.find(
          (user) => user.username === loggedInUser
        )
        if (currentUserData) {
          appState = currentUserData.trackerData
          if (!appState.workoutSchedule)
            appState.workoutSchedule = [
              false,
              false,
              false,
              false,
              false,
              false,
              false,
            ]
          updateUI()
        } else {
          Utils.showAlert("Error", "Could not find user data. Logging out.")
        }
      })
      .catch((error) => console.error("Error loading data:", error))
  }
  initializeApp()
})
