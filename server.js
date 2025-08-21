const express = require("express")
const fs = require("fs")
const path = require("path")

const app = express()
const port = 3000
const databasePath = path.join(__dirname, "database.json")

// --- MIDDLEWARE ---
app.use(express.static("public"))
app.use(express.json())

// --- API ROUTES ---
app.post("/api/login", (req, res) => {
  const { username, currentDayIndex } = req.body

  fs.readFile(databasePath, "utf8", (err, data) => {
    if (err)
      return res
        .status(500)
        .json({ status: "error", message: "Could not read database." })

    let db = JSON.parse(data)
    const userIndex = db.users.findIndex((u) => u.username === username)

    if (userIndex !== -1) {
      // User found, update their day index
      db.users[userIndex].trackerData.currentDayIndex = currentDayIndex

      // Write the updated database back to the file
      fs.writeFile(databasePath, JSON.stringify(db, null, 2), (writeErr) => {
        if (writeErr) return res.status(500).send("Error saving user data.")
        // Send success response after saving
        res.json({ status: "success", message: "Login successful." })
      })
    } else {
      res.status(404).json({ status: "error", message: "Username not found." })
    }
  })
})

app.get("/api/data", (req, res) => {
  fs.readFile(databasePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading database file.")
    res.send(data)
  })
})

app.post("/api/data", (req, res) => {
  const { username, trackerData } = req.body
  fs.readFile(databasePath, "utf8", (err, data) => {
    if (err)
      return res
        .status(500)
        .json({ status: "error", message: "Could not read database." })
    let db = JSON.parse(data)
    const userIndex = db.users.findIndex((u) => u.username === username)
    if (userIndex !== -1) {
      db.users[userIndex].trackerData = trackerData
      fs.writeFile(databasePath, JSON.stringify(db, null, 2), (err) => {
        if (err) return res.status(500).send("Error writing to database file.")
        res.json({ status: "success", message: "Data saved." })
      })
    } else {
      res
        .status(404)
        .json({ status: "error", message: "User not found during save." })
    }
  })
})

// --- START SERVER ---
app.listen(port, () => {
  console.log(
    `Server is running. Open http://localhost:${port}/login.html in your browser.`
  )
})
