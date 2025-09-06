const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const sounds = {};
const soundToButton = {};

const buttonRows = {
  btn1: 1, btn2: 1, btn3: 1, btn4: 1, btn5: 1,
  btn6: 2, btn7: 2, btn8: 2, btn9: 2, btn10: 2,
  btn11: 3, btn12: 3, btn13: 3, btn14: 3, btn15: 3,
  btn16: 4, btn17: 4, btn18: 4, btn19: 4, btn20: 4,
  btn21: 5, btn22: 5, btn23: 5, btn24: 5, btn25: 5
};

// Track the currently playing loop + button per row
const rowActive = {
  1: null,
  2: null,
  3: null,
  4: null,
  5: null
};

let masterLoopName = null;
let masterStartTime = null;
let masterLoopDuration = null;

// Load a single sound
async function loadSound(name, url) {
  const resp = await fetch(url);
  const buffer = await resp.arrayBuffer();
  sounds[name] = {
    buffer: await audioCtx.decodeAudioData(buffer),
    source: null,
    startTimeoutId: null // <-- add timeout ID holder here
  };
}

// Calculate the next "bar" start time for perfect sync
function getNextStartTime() {
  if (!masterStartTime || !masterLoopDuration) {
    // If master clock hasn't been set, start slightly in the future
    const bufferDuration = Object.values(sounds)[0]?.buffer?.duration || 1;
    const now = audioCtx.currentTime;
    const futureStart = now + 0.1; // safety margin
    masterStartTime = futureStart;
    masterLoopDuration = bufferDuration;
    console.log(`[Clock] Initializing master at ${futureStart.toFixed(2)}s (duration: ${bufferDuration}s)`);
    return futureStart;
  }

  const now = audioCtx.currentTime;
  const elapsed = now - masterStartTime;
  const bars = Math.floor(elapsed / masterLoopDuration);
  const nextBarTime = masterStartTime + (bars + 1) * masterLoopDuration;

  return nextBarTime;
}

// Start a loop with syncing
function startLoop(name, buttonId) {
  const sound = sounds[name];
  if (!sound) return;

  const source = audioCtx.createBufferSource();
  source.buffer = sound.buffer;
  source.loop = true;
  source.connect(audioCtx.destination);

  const button = document.getElementById(buttonId);
  const row = buttonRows[buttonId];
  const startTime = getNextStartTime();

  console.log(`[Start] ${name} scheduled for ${startTime.toFixed(2)} (current: ${audioCtx.currentTime.toFixed(2)})`);

  // Blink while waiting to start
  if (button && !button.classList.contains('active')) {
    button.classList.add('blink');
  }

  // Start the loop
  source.start(startTime);
  sound.source = source;

  // Store active loop in row
  rowActive[row] = { name, button };

  // Schedule the removal of blink & addition of active AFTER start time
  sound.startTimeoutId = setTimeout(() => {
    // If source was stopped before starting, do nothing
    if (!sound.source) return;

    if (button) {
      button.classList.remove('blink');
      button.classList.add('active');
    }

    if (!masterLoopName) {
      masterLoopName = name;
    }

    sound.startTimeoutId = null; // Clear timeout id after running
  }, (startTime - audioCtx.currentTime) * 1000);
}

// Stop a loop
function stopLoop(name) {
  const sound = sounds[name];
  if (!sound || !sound.source) return;

  // Stop the audio source
  sound.source.stop();
  sound.source = null;

  // Clear the start timeout if it hasn't run yet (queued sound)
  if (sound.startTimeoutId) {
    clearTimeout(sound.startTimeoutId);
    sound.startTimeoutId = null;

    // Remove blink immediately because sound was canceled before starting
    const btnId = soundToButton[name];
    const button = btnId ? document.getElementById(btnId) : null;
    if (button) {
      button.classList.remove('blink', 'active');
    }
  } else {
    // If the sound had started, remove active and blink normally
    const btnId = soundToButton[name];
    const button = btnId ? document.getElementById(btnId) : null;
    if (button) {
      button.classList.remove('active', 'blink');
    }
  }

  const btnId = soundToButton[name];
  const row = buttonRows[btnId];
  if (rowActive[row] && rowActive[row].name === name) {
    rowActive[row] = null;
  }

  if (masterLoopName === name) {
    masterLoopName = null;
    // Do not reset masterStartTime or masterLoopDuration to keep sync
  }
}

// Toggle loop on click
function toggleLoop(name, buttonId) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const row = buttonRows[buttonId];
  const current = rowActive[row];

  // Stop existing loop in row (which also cancels queued blink)
  if (current) stopLoop(current.name);

  // If clicking same button again, don't restart
  if (current && current.name === name) return;

  startLoop(name, buttonId);
}

// Load sounds and bind buttons
window.addEventListener("load", async () => {
  for (let i = 1; i <= 25; i++) {
    const name = `sound${i}`;
    const id = `btn${i}`;

    try {
      await loadSound(name, `${name}.wav`);
      soundToButton[name] = id;
    } catch (e) {
      console.warn(`[Skip] Could not load ${name}`);
    }

    const btn = document.getElementById(id);
    if (btn) {
      btn.onclick = () => toggleLoop(name, id);
    }
  }
});
