import * as Utils from "./utils.js"

document.addEventListener("DOMContentLoaded", () => {
  // --- SETUP ---
  const gymStreakDisplay = document.getElementById("gym-streak-display")
  const dietCounterDisplay = document.getElementById("diet-counter-display")
  const logGymButton = document.getElementById("log-gym-btn")
  const logDietButton = document.getElementById("log-diet-btn")
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
    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
    const isWorkoutDay =
      appState.workoutSchedule && appState.workoutSchedule[dayOfWeek]

    const workoutCompletedToday =
      localStorage.getItem(`workoutCompleted_${loggedInUser}`) === todayStr

    const totals = Utils.calculateTotals(appState)
    const goals = appState.goals || {}

    const checkCaloriesGoal = (total, goal) => {
      if (goal <= 0) return false
      const lowerBound = goal * 0.95
      const upperBound = goal * 1.1
      return total >= lowerBound && total <= upperBound
    }
    const checkProteinGoal = (total, goal) => {
      if (goal <= 0) return false
      const lowerBound = goal * 0.95
      return total >= lowerBound
    }
    const dietGoalsMet =
      checkCaloriesGoal(totals.calories, goals.calories) &&
      checkProteinGoal(totals.protein, goals.protein)

    const gymLoggedToday = appState.lastGymLog === todayStr
    const dietLoggedToday = appState.lastDietLog === todayStr

    const gymTaskDone = gymLoggedToday || !isWorkoutDay
    const dietTaskDone = dietLoggedToday

    logGymButton.disabled =
      dayIsComplete || gymLoggedToday || !isWorkoutDay || !workoutCompletedToday
    logDietButton.disabled = dayIsComplete || !dietGoalsMet || dietLoggedToday
    completeDayBtn.disabled = dayIsComplete || !gymTaskDone || !dietTaskDone

    completionStatus.textContent = dayIsComplete ? "✅ Day Complete" : ""
  }

  function logGym() {
    const todayStr = Utils.getTodayString()
    appState.gymStreak++
    appState.lastGymLog = todayStr
    updateUI()
    Utils.saveData(loggedInUser, appState)
  }
  function logDiet() {
    const todayStr = Utils.getTodayString()
    appState.dietCount++
    appState.lastDietLog = todayStr
    updateUI()
    Utils.saveData(loggedInUser, appState)
  }
  async function completeDay() {
    const today = new Date()
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
    const isWorkoutDay =
      appState.workoutSchedule && appState.workoutSchedule[dayOfWeek]
    const todayStr = Utils.getTodayString()
    const gymLoggedToday = appState.lastGymLog === todayStr
    const dietLoggedToday = appState.lastDietLog === todayStr

    const missedWorkout = isWorkoutDay && !gymLoggedToday
    const missedDiet = !dietLoggedToday
    if (missedWorkout || missedDiet) {
      const alertMessage =
        "You haven't logged everything. Your streaks will be reset if you continue."
      const userConfirmed = await Utils.showConfirm(
        "Are you sure?",
        alertMessage,
        "Yes, Complete Day",
        "No, Go Back"
      )
      if (!userConfirmed) return
      if (missedWorkout) appState.gymStreak = 0
      if (missedDiet) appState.dietCount = 0
    } else {
      Utils.showAlert("Nice Job!", "Day complete! Consistency is key.")
    }
    appState.lastCompletionDate = todayStr
    updateUI()
    Utils.saveData(loggedInUser, appState)
  }

  logGymButton.addEventListener("click", logGym)
  logDietButton.addEventListener("click", logDiet)
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
