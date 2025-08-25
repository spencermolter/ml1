import * as Utils from "./utils.js"

// --- STATE ---
let appState = {}
let loggedInUser = null
let currentEditingDay = null
let currentExerciseIndex = null

// --- DOM ELEMENTS ---
const editScheduleBtn = document.getElementById("edit-schedule-btn")
const editScheduleModal = document.getElementById("edit-schedule-modal")
const closeScheduleModalBtn = document.getElementById(
  "close-schedule-modal-btn"
)
const saveScheduleBtn = document.getElementById("save-schedule-btn")
const scheduleCheckboxes = document.querySelectorAll(
  '.schedule-form input[type="checkbox"]'
)

const templateEditorModal = document.getElementById("template-editor-modal")
const closeTemplateEditorBtn = document.getElementById(
  "close-template-editor-btn"
)
const templateEditorTitle = document.getElementById("template-editor-title")
const exerciseListContainer = document.getElementById(
  "day-template-exercises-list"
)
const addExerciseInput = document.getElementById("add-exercise-name-input")
const addExerciseBtn = document.getElementById("add-exercise-to-template-btn")
const addBreakDurationInput = document.getElementById(
  "add-break-duration-input"
)
const addBreakBtn = document.getElementById("add-break-btn")

const editExerciseModal = document.getElementById("edit-exercise-modal")
const editExerciseTitle = document.getElementById("edit-exercise-title")
const closeEditExerciseBtn = document.getElementById("close-edit-exercise-btn")
const editSetsInput = document.getElementById("edit-sets-input")
const editRepsInput = document.getElementById("edit-reps-input")
const editWeightInput = document.getElementById("edit-weight-input")
const editTimerInput = document.getElementById("edit-timer-input")
const saveExerciseChangesBtn = document.getElementById(
  "save-exercise-changes-btn"
)

// --- FUNCTIONS ---

function openEditScheduleModal() {
  if (appState.workoutSchedule) {
    scheduleCheckboxes.forEach((checkbox, index) => {
      checkbox.checked = appState.workoutSchedule[index]
    })
  }
  editScheduleModal.classList.add("visible")
}

function closeEditScheduleModal() {
  editScheduleModal.classList.remove("visible")
}

function saveSchedule() {
  const newSchedule = []
  scheduleCheckboxes.forEach((checkbox) => {
    newSchedule.push(checkbox.checked)
  })
  appState.workoutSchedule = newSchedule
  Utils.saveData(loggedInUser, appState)
  renderWorkoutDays(appState.workoutSchedule)
  closeEditScheduleModal()
}

function renderTemplateItems() {
  exerciseListContainer.innerHTML = ""
  const items = appState.workoutTemplates[currentEditingDay] || []

  if (items.length === 0) {
    exerciseListContainer.innerHTML = `<p>No items in this program yet. Add an exercise or break below!</p>`
    return
  }

  items.forEach((item, index) => {
    const itemEl = document.createElement("div")
    if (item.type === "exercise") {
      itemEl.className = "template-exercise-item"

      let detailsHtml
      if (item.sets) {
        const weightText =
          typeof item.weight === "number" ? `${item.weight}lbs` : "no weight"
        const timerText =
          typeof item.timer === "number" ? `${item.timer}s rest` : "no rest"
        detailsHtml = `<span class="exercise-details">${item.sets}x${item.reps} @ ${weightText}, ${timerText}</span>`
      } else {
        detailsHtml = `<span class="exercise-details prompt">Enter values →</span>`
      }

      itemEl.innerHTML = `
                <span class="exercise-name">${item.name}</span>
                ${detailsHtml}
                <div class="exercise-actions">
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">&times;</button>
                </div>
            `
    } else if (item.type === "break") {
      itemEl.className = "template-break-item"
      itemEl.innerHTML = `
                <span>--- ${item.duration} second rest ---</span>
                <button class="delete-btn" data-index="${index}">&times;</button>
            `
    }
    exerciseListContainer.appendChild(itemEl)
  })
}

function openTemplateEditorModal(day) {
  currentEditingDay = day
  templateEditorTitle.textContent = `Edit ${day} Program`
  renderTemplateItems()
  templateEditorModal.classList.add("visible")
}

function closeTemplateEditorModal() {
  templateEditorModal.classList.remove("visible")
  currentEditingDay = null
}

function addExerciseToTemplate() {
  const exerciseName = addExerciseInput.value.trim()
  if (exerciseName && currentEditingDay) {
    if (!appState.workoutTemplates[currentEditingDay]) {
      appState.workoutTemplates[currentEditingDay] = []
    }
    const newExercise = {
      type: "exercise",
      name: exerciseName,
      sets: null,
      reps: null,
      weight: null,
      timer: null,
    }
    appState.workoutTemplates[currentEditingDay].push(newExercise)
    Utils.saveData(loggedInUser, appState)
    renderTemplateItems()
    addExerciseInput.value = ""
  }
}

function addBreakToTemplate() {
  const duration = parseInt(addBreakDurationInput.value)
  if (duration > 0 && currentEditingDay) {
    if (!appState.workoutTemplates[currentEditingDay]) {
      appState.workoutTemplates[currentEditingDay] = []
    }
    const newBreak = { type: "break", duration: duration }
    appState.workoutTemplates[currentEditingDay].push(newBreak)
    Utils.saveData(loggedInUser, appState)
    renderTemplateItems()
    addBreakDurationInput.value = ""
  }
}

function deleteItemFromTemplate(index) {
  if (currentEditingDay) {
    appState.workoutTemplates[currentEditingDay].splice(index, 1)
    Utils.saveData(loggedInUser, appState)
    renderTemplateItems()
  }
}

function openEditExerciseModal(index) {
  const item = appState.workoutTemplates[currentEditingDay][index]
  if (item.type !== "exercise") return

  currentExerciseIndex = index
  editExerciseTitle.textContent = `Edit ${item.name}`
  editSetsInput.value = item.sets || ""
  editRepsInput.value = item.reps || ""
  editWeightInput.value = item.weight || ""
  editTimerInput.value = item.timer || ""
  editExerciseModal.classList.add("visible")
}

function closeEditExerciseModal() {
  editExerciseModal.classList.remove("visible")
  currentExerciseIndex = null
}

function saveExerciseChanges() {
  if (currentEditingDay && currentExerciseIndex !== null) {
    const exercise =
      appState.workoutTemplates[currentEditingDay][currentExerciseIndex]
    exercise.sets = parseInt(editSetsInput.value) || null
    exercise.reps = parseInt(editRepsInput.value) || null
    exercise.weight = parseInt(editWeightInput.value) || null
    exercise.timer = parseInt(editTimerInput.value) || null
    Utils.saveData(loggedInUser, appState)
    renderTemplateItems()
    closeEditExerciseModal()
  }
}

async function initializeApp() {
  loggedInUser = localStorage.getItem("loggedInUser")
  if (!loggedInUser) {
    window.location.href = "/login.html"
    return
  }
  await Utils.loadNavbar(loggedInUser)
  try {
    const response = await fetch("/api/data")
    const data = await response.json()
    const currentUserData = data.users.find(
      (user) => user.username === loggedInUser
    )
    if (currentUserData) {
      appState = currentUserData.trackerData
      if (!appState.workoutTemplates) {
        appState.workoutTemplates = {}
      }
    }
    if (appState.workoutSchedule) {
      renderWorkoutDays(appState.workoutSchedule)
    } else {
      document.getElementById("workout-templates-container").innerHTML =
        '<p>No workout schedule found. Click "Edit Schedule" to set one up.</p>'
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    document.getElementById("workout-templates-container").innerHTML =
      "<p>Could not load workout data.</p>"
  }
}

function renderWorkoutDays(schedule) {
  const container = document.getElementById("workout-templates-container")
  container.innerHTML = ""
  const workoutDays = schedule
    .map((isWorkout, index) => {
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ]
      return { day: days[index], isWorkout: isWorkout }
    })
    .filter((day) => day.isWorkout)

  if (workoutDays.length === 0) {
    container.innerHTML =
      '<p>You have no workout days scheduled. Click "Edit Schedule" to set one up.</p>'
    return
  }

  const weekView = document.createElement("div")
  weekView.className = "workout-week-view"
  workoutDays.forEach((day) => {
    const dayEl = document.createElement("div")
    dayEl.className = "day-template-btn workout-day"
    dayEl.textContent = day.day
    dayEl.addEventListener("click", () => {
      openTemplateEditorModal(day.day)
    })
    weekView.appendChild(dayEl)
  })
  container.appendChild(weekView)
}

// --- EVENT LISTENERS ---
editScheduleBtn.addEventListener("click", openEditScheduleModal)
closeScheduleModalBtn.addEventListener("click", closeEditScheduleModal)
saveScheduleBtn.addEventListener("click", saveSchedule)

closeTemplateEditorBtn.addEventListener("click", closeTemplateEditorModal)
addExerciseBtn.addEventListener("click", addExerciseToTemplate)
addBreakBtn.addEventListener("click", addBreakToTemplate)

exerciseListContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index
    deleteItemFromTemplate(index)
  }
  if (e.target.classList.contains("edit-btn")) {
    const index = e.target.dataset.index
    openEditExerciseModal(index)
  }
})

closeEditExerciseBtn.addEventListener("click", closeEditExerciseModal)
saveExerciseChangesBtn.addEventListener("click", saveExerciseChanges)

document.addEventListener("DOMContentLoaded", initializeApp)
