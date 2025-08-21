import * as Utils from "./utils.js"

document.addEventListener("DOMContentLoaded", () => {
  // --- SETUP ---
  const mainContainer = document.querySelector(".container")
  const caloriesTotalEl = document.getElementById("calories-total")
  const proteinTotalEl = document.getElementById("protein-total")
  const carbsTotalEl = document.getElementById("carbs-total")
  const fatTotalEl = document.getElementById("fat-total")
  const caloriesProgress = document.getElementById("calories-progress")
  const proteinProgress = document.getElementById("protein-progress")
  const carbsProgress = document.getElementById("carbs-progress")
  const fatProgress = document.getElementById("fat-progress")
  const mealsContainer = document.getElementById("meals-container")
  const addMealBtn = document.getElementById("add-meal-btn")

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

  // --- STATE ---
  let loggedInUser = null
  let appState = {}
  let currentMealIndex = null

  // --- RENDER & CALCULATION FUNCTIONS ---
  function renderPage() {
    if (!appState || !appState.goals) return
    renderMeals()
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

    caloriesProgress.style.width = `${Math.min(
      100,
      (totals.calories / (goals.calories || 1)) * 100
    )}%`
    proteinProgress.style.width = `${Math.min(
      100,
      (totals.protein / (goals.protein || 1)) * 100
    )}%`
    carbsProgress.style.width = `${Math.min(
      100,
      (totals.carbs / (goals.carbs || 1)) * 100
    )}%`
    fatProgress.style.width = `${Math.min(
      100,
      (totals.fat / (goals.fat || 1)) * 100
    )}%`
  }

  function renderMeals() {
    mealsContainer.innerHTML = ""
    const todayLog = appState.foodLog?.[Utils.getTodayString()] || []
    todayLog.forEach((meal, mealIndex) => {
      const mealCard = document.createElement("div")
      mealCard.className = "meal-card"
      let foodItemsHTML = ""
      meal.foods.forEach((food, foodIndex) => {
        foodItemsHTML += `<li class="food-item"><span>${food.name}</span><div class="food-item-actions"><button class="info-btn" data-meal-index="${mealIndex}" data-food-index="${foodIndex}">ⓘ</button><button class="delete-btn delete-food-btn" data-meal-index="${mealIndex}" data-food-index="${foodIndex}">&times;</button></div></li>`
      })
      mealCard.innerHTML = `<div class="meal-header"><div class="meal-header-actions"><h3>${meal.mealName}</h3><button class="log-button add-food-btn" data-meal-index="${mealIndex}">Add Food</button></div><button class="delete-btn delete-meal-btn" data-meal-index="${mealIndex}">&times;</button></div><ul class="food-list">${foodItemsHTML}</ul>`
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
    }
    editGoalsModal.classList.add("visible")
  }
  function closeEditGoalsModal() {
    editGoalsModal.classList.remove("visible")
  }

  // --- EVENT LISTENERS ---
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
    renderMeals()
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
    renderMeals()
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
    Utils.saveData(loggedInUser, appState)
    renderMeals()
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

          renderPage()
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
