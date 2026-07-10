// Element references
const minutesInput = document.getElementById('minutesInput');
const secondsInput = document.getElementById('secondsInput');
const display = document.getElementById('display');
const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// State variables
let timeLeft = 0;      // seconds remaining, counts down
let timerId = null;    // setInterval handle; null means no timer running

function updateDisplay() {

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  display.textContent = `${mm}:${ss}`;
  
}

function startTimer() {

  // 1. GUARD: if a timer is already running, bail (prevents double-speed bug)

  if (timerId !== null) return;

  // 2. READ inputs only on a fresh start; if resuming from pause, timeLeft
  //    already holds the remaining seconds, so leave it untouched.

    if (timeLeft <= 0) {
        
      const minutes = Number(minutesInput.value);
      const seconds = Number(secondsInput.value);
      timeLeft = minutes * 60 + seconds;

      // 3. GUARD: nothing to count down (only possible on a fresh start)
      
      if (timeLeft <= 0) { status.textContent = 'Please set a time.'; return; }
    
    }

  // 4. Clear any status message, update display immediately
    
    status.textContent = '';
    updateDisplay();

  // 5. START the interval — store the ID in timerId
    
    timerId = setInterval(function() {

    // the tick logic (see below)
    
    timeLeft -= 1;          // decrement
    updateDisplay();         // show the new time

    if (timeLeft <= 0) {
    clearInterval(timerId);   // STOP the interval
    timerId = null;           // mark "no timer running"
    status.textContent = "Time's up! ⏰";
    }
        }, 1000);
    }

function pauseTimer() {

  // Nothing to pause if no timer is running

  if (timerId === null) return;

  clearInterval(timerId);   // stop ticking
  timerId = null;           // mark "no timer running" — timeLeft is kept for resume
  status.textContent = 'Paused';

}

function resetTimer() {

  clearInterval(timerId);   // safe even if timerId is null (no-op)
  timerId = null;           // no timer running
  timeLeft = 0;             // back to zero so the next Start reads the inputs
  updateDisplay();          // show 00:00
  status.textContent = '';  // clear any message

}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);