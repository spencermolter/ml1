let timerId = null
let startTime = null
let duration = 0

self.onmessage = function (e) {
  const { command, duration: newDuration } = e.data

  if (command === "start") {
    if (timerId) clearInterval(timerId)
    startTime = Date.now()
    duration = newDuration

    timerId = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const timeLeft = Math.max(0, Math.round(duration - elapsed))

      self.postMessage({ type: "tick", timeLeft: timeLeft })

      if (timeLeft <= 0) {
        clearInterval(timerId)
        timerId = null
        self.postMessage({ type: "done" })
      }
    }, 1000)
  } else if (command === "stop") {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }
}
