import * as Utils from "./utils.js"

document.addEventListener("DOMContentLoaded", () => {
  // --- SETUP ---
  const mainContainer = document.querySelector(".container")
  const foodLogCard = document.getElementById("food-log-card")
  const caloriesTotalEl = document.getElementById("calories-total")
  const proteinTotalEl = document.getElementById("protein-total")
  const carbsTotalEl = document.getElementById("carbs-total")
  const fatTotalEl = document.getElementById("fat-total")
  const caloriesProgress = document.getElementById("calories-progress")
  const proteinProgress = document.getElementById("protein-progress")
  const carbsProgress = document.getElementById("carbs-progress")
  const fatProgress = document.getElementById("fat-progress")
  const caloriesProgressText = document.getElementById("calories-progress-text")
  const proteinProgressText = document.getElementById("protein-progress-text")
  const carbsProgressText = document.getElementById("carbs-progress-text")
  const fatProgressText = document.getElementById("fat-progress-text")
  const mealsContainer = document.getElementById("meals-container")
  const addMealBtn = document.getElementById("add-meal-btn")

  // Hydration DOM elements
  const hydrationCard = document.querySelector(".hydration-card")
  const hydrationSummary = document.getElementById("hydration-summary")
  const hydrationProgressFill = document.getElementById(
    "hydration-progress-fill"
  )
  const hydrationInput = document.getElementById("hydration-input")
  const hydrationMinusBtn = document.getElementById("hydration-minus-btn")
  const hydrationPlusBtn = document.getElementById("hydration-plus-btn")
  const logWaterBtn = document.getElementById("log-water-btn")
  const hydrationCompleteBadge = document.getElementById(
    "hydration-complete-badge"
  )

  // Modals
  const addFoodModal = document.getElementById("add-food-modal")
  const modalTitle = document.getElementById("modal-title")
  const addToMealBtn = document.getElementById("add-to-meal-btn")
  const addAndPresetBtn = document.getElementById("add-and-preset-btn")
  const closeFoodModalBtn = document.getElementById("close-food-modal-btn")
  const foodNameInput = document.getElementById("food-name-input")
  const caloriesInput = document.getElementById("calories-input")
  const proteinInput = document.getElementById("protein-input")
  const carbsInput = document.getElementById("carbs-input")
  const fatInput = document.getElementById("fat-input")
  const addMealModal = document.getElementById("add-meal-modal")
  const closeMealModalBtn = document.getElementById("close-meal-modal-btn")
  const mealPresetBtns = document.querySelectorAll(".meal-preset-btn")
  const customMealNameInput = document.getElementById("custom-meal-name-input")
  const addCustomMealBtn = document.getElementById("add-custom-meal-btn")
  const presetFoodSelect = document.getElementById("preset-food-select")
  const editGoalsBtn = document.getElementById("edit-goals-btn")
  const editGoalsModal = document.getElementById("edit-goals-modal")
  const closeGoalsModalBtn = document.getElementById("close-goals-modal-btn")
  const saveGoalsBtn = document.getElementById("save-goals-btn")
  const editCaloriesInput = document.getElementById("edit-calories-input")
  const editProteinInput = document.getElementById("edit-protein-input")
  const editCarbsInput = document.getElementById("edit-carbs-input")
  const editFatInput = document.getElementById("edit-fat-input")
  const editHydrationInput = document.getElementById("edit-hydration-input")

  // --- STATE ---
  let loggedInUser = null
  let appState = {}
  let currentMealIndex = null

  // --- HYDRATION COUNTER FUNCTIONS ---
  function updateCounterButtons() {
    const currentValue = parseInt(hydrationInput.value) || 0
    hydrationMinusBtn.disabled = currentValue <= 0
    hydrationPlusBtn.disabled = currentValue >= 99
  }

  function addRemoveWaterButton() {
    const today = Utils.getTodayString()
    const currentHydration = appState.dailyHydration?.[today] || 0

    // Only show remove button if there's water logged
    if (currentHydration > 0) {
      const hydrationLogForm = document.querySelector(".hydration-log-form")

      // Check if remove button already exists
      if (!document.getElementById("remove-water-btn")) {
        const removeBtn = document.createElement("button")
        removeBtn.id = "remove-water-btn"
        removeBtn.className = "log-button skip-button remove-water-btn"
        removeBtn.textContent = "Remove"

        removeBtn.addEventListener("click", () => {
          const removeAmount = parseInt(hydrationInput.value)
          if (!removeAmount || removeAmount <= 0) {
            Utils.showAlert(
              "Invalid Amount",
              "Please enter a positive number for ounces to remove."
            )
            return
          }

          const today = Utils.getTodayString()
          const currentAmount = appState.dailyHydration?.[today] || 0
          const newAmount = Math.max(0, currentAmount - removeAmount)

          appState.dailyHydration[today] = newAmount
          Utils.saveData(loggedInUser, appState)
          renderHydration()

          // Reset input
          hydrationInput.value = "8"
          updateCounterButtons()
        })

        // Add the remove button to the hydration log form
        hydrationLogForm.appendChild(removeBtn)
      }
    } else {
      // Remove the button if no water is logged
      const removeBtn = document.getElementById("remove-water-btn")
      if (removeBtn) {
        removeBtn.remove()
      }
    }
  }

  // --- RENDER & CALCULATION FUNCTIONS ---
  function applyDietCompletionStyle() {
    const today = Utils.getTodayString()
    const todayLog = appState.foodLog?.[today] || []
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    todayLog.forEach((meal) => {
      meal.foods.forEach((food) => {
        totals.calories += food.calories || 0
        totals.protein += food.protein || 0
        totals.carbs += food.carbs || 0
        totals.fat += food.fat || 0
      })
    })

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

    if (dietGoalsMet) {
      if (appState.lastDietLog !== today) {
        appState.lastDietLog = today
        Utils.saveData(loggedInUser, appState)
      }
      foodLogCard.classList.add("diet-complete-overlay")
      if (!foodLogCard.querySelector(".completion-message")) {
        const congratulations = document.createElement("div")
        congratulations.className = "completion-message"
        const dayIsCompleted = appState.lastCompletionDate === today
        let buttonHTML = ""
        if (!dayIsCompleted) {
          buttonHTML = `<button id="undo-diet-log-btn" class="log-button">Made a mistake?</button>`
        }
        congratulations.innerHTML = `<h2>Diet Goals Met!</h2><p>Great job! You've hit your diet goals for the day.</p>${buttonHTML}`
        foodLogCard.appendChild(congratulations)
        const undoButton = document.getElementById("undo-diet-log-btn")
        if (undoButton) {
          undoButton.addEventListener("click", () => {
            appState.lastDietLog = null
            if (appState.lastCompletionDate === today) {
              appState.lastCompletionDate = null
            }
            Utils.saveData(loggedInUser, appState)
            foodLogCard.classList.remove("diet-complete-overlay")
            congratulations.remove()
          })
        }
      }
    }
  }

  function renderHydration() {
    const today = Utils.getTodayString()
    const currentHydration = appState.dailyHydration?.[today] || 0
    const hydrationGoal = appState.goals?.hydration || 0
    const calculationGoal = hydrationGoal > 0 ? hydrationGoal : 1

    hydrationSummary.textContent = `${currentHydration} / ${hydrationGoal} oz `

    const percentage = Math.min(100, (currentHydration / calculationGoal) * 100)
    hydrationProgressFill.style.width = `${percentage}%`

    if (currentHydration >= hydrationGoal && hydrationGoal > 0) {
      hydrationCard.classList.add("goal-met")
      hydrationCompleteBadge.style.display = "inline-block"
    } else {
      hydrationCard.classList.remove("goal-met")
      hydrationCompleteBadge.style.display = "none"
    }

    // Add or remove the remove water button
    addRemoveWaterButton()
  }

  function renderPage() {
    if (!appState || !appState.goals) return
    renderMeals()
    renderHydration()
    applyDietCompletionStyle()
  }

  function updateCircularProgress(progressElement, textElement, percentage) {
    const radius = 35
    const circumference = 2 * Math.PI * radius
    if (percentage === 0) {
      progressElement.style.strokeDasharray = circumference
      progressElement.style.strokeDashoffset = circumference
      textElement.textContent = "0%"
    } else {
      const offset = circumference - (percentage / 100) * circumference
      progressElement.style.strokeDasharray = circumference
      progressElement.style.strokeDashoffset = offset
      textElement.textContent = Math.round(percentage) + "%"
    }
  }

  function calculateTotals() {
    const todayLog = appState.foodLog?.[Utils.getTodayString()] || []
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    todayLog.forEach((meal) => {
      meal.foods.forEach((food) => {
        totals.calories += food.calories || 0
        totals.protein += food.protein || 0
        totals.carbs += food.carbs || 0
        totals.fat += food.fat || 0
      })
    })

    const goals = appState.goals || {}
    caloriesTotalEl.textContent = `${totals.calories} / ${goals.calories || 0}`
    proteinTotalEl.textContent = `${totals.protein}g / ${goals.protein || 0}g`
    carbsTotalEl.textContent = `${totals.carbs}g / ${goals.carbs || 0}g`
    fatTotalEl.textContent = `${totals.fat}g / ${goals.fat || 0}g`

    const caloriesPercentage = Math.min(
      100,
      (totals.calories / (goals.calories || 1)) * 100
    )
    const proteinPercentage = Math.min(
      100,
      (totals.protein / (goals.protein || 1)) * 100
    )
    const carbsPercentage = Math.min(
      100,
      (totals.carbs / (goals.carbs || 1)) * 100
    )
    const fatPercentage = Math.min(100, (totals.fat / (goals.fat || 1)) * 100)

    updateCircularProgress(
      caloriesProgress,
      caloriesProgressText,
      caloriesPercentage
    )
    updateCircularProgress(
      proteinProgress,
      proteinProgressText,
      proteinPercentage
    )
    updateCircularProgress(carbsProgress, carbsProgressText, carbsPercentage)
    updateCircularProgress(fatProgress, fatProgressText, fatPercentage)
  }

  function renderMeals() {
    mealsContainer.innerHTML = ""
    const todayLog = appState.foodLog?.[Utils.getTodayString()] || []
    todayLog.forEach((meal, mealIndex) => {
      const mealCard = document.createElement("div")
      mealCard.className = "meal-card"
      let foodItemsHTML = ""
      meal.foods.forEach((food, foodIndex) => {
        foodItemsHTML += `<li class="food-item">
                                        <button class="info-btn" data-meal-index="${mealIndex}" data-food-index="${foodIndex}">ⓘ</button>
                                        <span class="food-name">${food.name}</span>
                                        <button class="delete-btn delete-food-btn" data-meal-index="${mealIndex}" data-food-index="${foodIndex}">&times;</button>
                                    </li>`
      })
      mealCard.innerHTML = `<div class="meal-header">
                                        <div class="meal-header-actions">
                                            <h3>${meal.mealName}</h3>
                                            <button class="log-button add-food-btn" data-meal-index="${mealIndex}">Add Food</button>
                                        </div>
                                        <button class="delete-btn delete-meal-btn" data-meal-index="${mealIndex}">&times;</button>
                                    </div>
                                    <ul class="food-list">${foodItemsHTML}</ul>`
      mealsContainer.appendChild(mealCard)
    })
    calculateTotals()
  }

  // --- ACTION FUNCTIONS ---
  function addNewMeal(mealName) {
    if (mealName) {
      const today = Utils.getTodayString()
      if (!appState.foodLog[today]) {
        appState.foodLog[today] = []
      }
      appState.foodLog[today].push({ mealName: mealName, foods: [] })
      Utils.saveData(loggedInUser, appState)
      renderMeals()
    }
  }

  // --- MODAL FUNCTIONS ---
  function openAddFoodModal(mealIndex) {
    currentMealIndex = mealIndex
    const mealName =
      appState.foodLog?.[Utils.getTodayString()]?.[mealIndex]?.mealName || ""
    modalTitle.textContent = `Add Food to ${mealName}`

    presetFoodSelect.innerHTML =
      '<option value="-1">-- Select or Add Custom --</option>'
    if (appState.presetFoods) {
      appState.presetFoods.forEach((food, index) => {
        const option = document.createElement("option")
        option.value = index
        option.textContent = food.name
        presetFoodSelect.appendChild(option)
      })
    }
    addFoodModal.classList.add("visible")
  }

  function closeAddFoodModal() {
    addFoodModal.classList.remove("visible")
    foodNameInput.value = ""
    caloriesInput.value = ""
    proteinInput.value = ""
    carbsInput.value = ""
    fatInput.value = ""
    currentMealIndex = null
  }

  function openEditGoalsModal() {
    if (appState.goals) {
      editCaloriesInput.value = appState.goals.calories
      editProteinInput.value = appState.goals.protein
      editCarbsInput.value = appState.goals.carbs
      editFatInput.value = appState.goals.fat
      editHydrationInput.value = appState.goals.hydration
    }
    editGoalsModal.classList.add("visible")
  }

  function closeEditGoalsModal() {
    editGoalsModal.classList.remove("visible")
  }

  // --- HYDRATION EVENT LISTENERS ---
  hydrationPlusBtn.addEventListener("click", () => {
    const currentValue = parseInt(hydrationInput.value) || 0
    const newValue = Math.min(99, currentValue + 1)
    hydrationInput.value = newValue
    updateCounterButtons()
  })

  hydrationMinusBtn.addEventListener("click", () => {
    const currentValue = parseInt(hydrationInput.value) || 0
    const newValue = Math.max(0, currentValue - 1)
    hydrationInput.value = newValue
    updateCounterButtons()
  })

  hydrationInput.addEventListener("input", () => {
    const value = parseInt(hydrationInput.value) || 0
    hydrationInput.value = Math.max(0, Math.min(99, value))
    updateCounterButtons()
  })

  logWaterBtn.addEventListener("click", () => {
    const amount = parseInt(hydrationInput.value)
    if (!amount || amount <= 0) {
      Utils.showAlert(
        "Invalid Amount",
        "Please enter a positive number for ounces."
      )
      return
    }

    const today = Utils.getTodayString()
    if (!appState.dailyHydration) {
      appState.dailyHydration = {}
    }
    if (!appState.dailyHydration[today]) {
      appState.dailyHydration[today] = 0
    }

    appState.dailyHydration[today] += amount
    Utils.saveData(loggedInUser, appState)
    renderHydration()

    // Reset to default value instead of clearing
    hydrationInput.value = "8"
    updateCounterButtons()
  })

  // --- OTHER EVENT LISTENERS ---
  addMealBtn.addEventListener("click", () =>
    addMealModal.classList.add("visible")
  )
  closeMealModalBtn.addEventListener("click", () =>
    addMealModal.classList.remove("visible")
  )

  mealPresetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      addNewMeal(btn.textContent)
      addMealModal.classList.remove("visible")
    })
  })

  addCustomMealBtn.addEventListener("click", () => {
    const mealName = customMealNameInput.value.trim()
    if (mealName) {
      addNewMeal(mealName)
      customMealNameInput.value = ""
      addMealModal.classList.remove("visible")
    }
  })

  mealsContainer.addEventListener("click", async (e) => {
    const targetButton = e.target.closest("button")
    if (!targetButton) return
    const today = Utils.getTodayString()

    if (targetButton.classList.contains("info-btn")) {
      const mealIndex = targetButton.dataset.mealIndex
      const foodIndex = targetButton.dataset.foodIndex
      const food = appState.foodLog[today][mealIndex].foods[foodIndex]
      const message = `Calories: ${food.calories}\nProtein: ${food.protein}g\nCarbs: ${food.carbs}g\nFat: ${food.fat}g`
      Utils.showAlert(food.name, message)
    }
    if (targetButton.classList.contains("add-food-btn")) {
      const mealIndex = targetButton.dataset.mealIndex
      openAddFoodModal(mealIndex)
    }
    if (targetButton.classList.contains("delete-food-btn")) {
      const mealIndex = targetButton.dataset.mealIndex
      const foodIndex = targetButton.dataset.foodIndex
      const foodName = appState.foodLog[today][mealIndex].foods[foodIndex].name
      const userConfirmed = await Utils.showConfirm(
        "Delete Food?",
        `Are you sure you want to delete "${foodName}"?`,
        "Yes, Delete",
        "Cancel"
      )
      if (userConfirmed) {
        appState.foodLog[today][mealIndex].foods.splice(foodIndex, 1)
        Utils.saveData(loggedInUser, appState)
        renderMeals()
      }
    }
    if (targetButton.classList.contains("delete-meal-btn")) {
      const mealIndex = targetButton.dataset.mealIndex
      const mealName = appState.foodLog[today][mealIndex].mealName
      const userConfirmed = await Utils.showConfirm(
        "Delete Meal?",
        `Are you sure you want to delete the "${mealName}" meal?`,
        "Yes, Delete",
        "Cancel"
      )
      if (userConfirmed) {
        appState.foodLog[today].splice(mealIndex, 1)
        Utils.saveData(loggedInUser, appState)
        renderMeals()
      }
    }
  })

  presetFoodSelect.addEventListener("change", () => {
    const selectedIndex = presetFoodSelect.value
    if (selectedIndex > -1) {
      const selectedFood = appState.presetFoods[selectedIndex]
      foodNameInput.value = selectedFood.name
      caloriesInput.value = selectedFood.calories
      proteinInput.value = selectedFood.protein
      carbsInput.value = selectedFood.carbs
      fatInput.value = selectedFood.fat
    } else {
      foodNameInput.value = ""
      caloriesInput.value = ""
      proteinInput.value = ""
      carbsInput.value = ""
      fatInput.value = ""
    }
  })

  addToMealBtn.addEventListener("click", () => {
    const newFood = {
      name: foodNameInput.value || "Unnamed Food",
      calories: parseInt(caloriesInput.value) || 0,
      protein: parseInt(proteinInput.value) || 0,
      carbs: parseInt(carbsInput.value) || 0,
      fat: parseInt(fatInput.value) || 0,
    }
    const today = Utils.getTodayString()
    if (!appState.foodLog[today]) appState.foodLog[today] = []
    appState.foodLog[today][currentMealIndex].foods.push(newFood)
    Utils.saveData(loggedInUser, appState)
    renderPage()
    closeAddFoodModal()
  })

  addAndPresetBtn.addEventListener("click", () => {
    const newFood = {
      name: foodNameInput.value || "Unnamed Food",
      calories: parseInt(caloriesInput.value) || 0,
      protein: parseInt(proteinInput.value) || 0,
      carbs: parseInt(carbsInput.value) || 0,
      fat: parseInt(fatInput.value) || 0,
    }
    const today = Utils.getTodayString()
    if (!appState.foodLog[today]) appState.foodLog[today] = []
    appState.foodLog[today][currentMealIndex].foods.push(newFood)
    if (!appState.presetFoods) appState.presetFoods = []
    appState.presetFoods.push(newFood)
    Utils.saveData(loggedInUser, appState)
    renderPage()
    closeAddFoodModal()
  })

  closeFoodModalBtn.addEventListener("click", closeAddFoodModal)
  editGoalsBtn.addEventListener("click", openEditGoalsModal)
  closeGoalsModalBtn.addEventListener("click", closeEditGoalsModal)

  saveGoalsBtn.addEventListener("click", () => {
    appState.goals.calories = parseInt(editCaloriesInput.value) || 0
    appState.goals.protein = parseInt(editProteinInput.value) || 0
    appState.goals.carbs = parseInt(editCarbsInput.value) || 0
    appState.goals.fat = parseInt(editFatInput.value) || 0
    appState.goals.hydration = parseInt(editHydrationInput.value) || 0
    Utils.saveData(loggedInUser, appState)
    renderPage()
    closeEditGoalsModal()
  })

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

  // --- INITIALIZE ---
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
          if (!appState.foodLog) appState.foodLog = {}
          if (!appState.goals) appState.goals = {}
          if (!appState.presetFoods) appState.presetFoods = []
          if (appState.goals.hydration === undefined) {
            appState.goals.hydration = 64
          }
          if (!appState.dailyHydration) appState.dailyHydration = {}
          renderPage()
          updateCounterButtons() // Initialize counter button states
        } else {
          Utils.showAlert("Error", "Could not find user data. Logging out.")
          setTimeout(() => Utils.logout(loggedInUser), 2000)
        }
      })
      .catch((error) => {
        console.error("Could not load data from server!", error)
        Utils.showAlert(
          "Server Error",
          "Could not load data. Please check the server and try again."
        )
      })
  }

  initializeApp()
})
