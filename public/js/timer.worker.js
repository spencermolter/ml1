let timerInterval = null
let timeLeft = 0

self.onmessage = function (e) {
  if (e.data.command === "start") {
    timeLeft = e.data.duration
    // Clear any existing timer
    if (timerInterval) {
      clearInterval(timerInterval)
    }
    timerInterval = setInterval(() => {
      timeLeft--
      self.postMessage({ type: "tick", timeLeft: timeLeft })
      if (timeLeft <= 0) {
        clearInterval(timerInterval)
        timerInterval = null
        self.postMessage({ type: "done" })
      }
    }, 1000)
  } else if (e.data.command === "stop") {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
}
