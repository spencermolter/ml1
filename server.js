const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")
const path = require("path")

const app = express()
const port = process.env.PORT || 3000
const DB_PATH = path.join(__dirname, "database.json")

app.use(bodyParser.json())

// This line correctly serves all files from the 'public' directory.
// A request to '/' will automatically serve 'public/index.html'.
app.use(express.static(path.join(__dirname, "public")))

function readData() {
  if (!fs.existsSync(DB_PATH)) {
    return { users: [] }
  }
  const data = fs.readFileSync(DB_PATH, "utf8")
  return JSON.parse(data)
}

function writeData(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// --- API ROUTES ---
app.post("/api/login", (req, res) => {
  const { username, currentDayIndex } = req.body
  const db = readData()
  let user = db.users.find((u) => u.username === username)

  // Check if user exists in the database
  if (!user) {
    res
      .status(401)
      .json({
        status: "error",
        message:
          "Username not found. Please check your username and try again.",
      })
    return
  }

  res.json({ status: "success", message: "Logged in successfully" })
})

app.get("/api/data", (req, res) => {
  const db = readData()
  res.json(db)
})

app.post("/api/data", (req, res) => {
  const { username, trackerData } = req.body
  const db = readData()
  const userIndex = db.users.findIndex((u) => u.username === username)
  if (userIndex !== -1) {
    db.users[userIndex].trackerData = trackerData
    writeData(db)
    res.json({ status: "success", message: "Data saved" })
  } else {
    res.status(404).json({ status: "error", message: "User not found" })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
