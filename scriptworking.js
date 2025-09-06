const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const sounds = {};
const soundToButton = {};
const buttonRows = {
  btn1:1, btn2:1, btn3:1, btn4:1, btn5:1,
  btn6:2, btn7:2, btn8:2, btn9:2, btn10:2,
  btn11:3, btn12:3, btn13:3, btn14:3, btn15:3,
  btn16:4, btn17:4, btn18:4, btn19:4, btn20:4,
  btn21:5, btn22:5, btn23:5, btn24:5, btn25:5
};

let masterLoopName = null;
let masterStartTime = null;
let masterLoopDuration = null;
const rowActive = {1:null,2:null,3:null,4:null,5:null};

// Load sound
async function loadSound(name,url){
  const resp = await fetch(url);
  const buffer = await resp.arrayBuffer();
  sounds[name] = { buffer: await audioCtx.decodeAudioData(buffer), source: null };
}

// Get next bar start
function getNextStartTime(){
  if(!masterStartTime || !masterLoopDuration) return audioCtx.currentTime;
  const now = audioCtx.currentTime;
  const elapsed = now-masterStartTime;
  const bars = Math.floor(elapsed/masterLoopDuration);
  return masterStartTime + (bars+1)*masterLoopDuration;
}

// Start a loop
function startLoop(name,buttonId){
  const sound = sounds[name];
  if(!sound) return;

  const source = audioCtx.createBufferSource();
  source.buffer = sound.buffer;
  source.loop = true;
  source.connect(audioCtx.destination);

  const button = buttonId ? document.getElementById(buttonId) : null;
  const startTime = getNextStartTime();

  if(button && !button.classList.contains('active')) button.classList.add('blink');

  source.start(startTime);
  sound.source = source;

  const row = buttonRows[buttonId];
  rowActive[row] = name;

  setTimeout(()=>{
    if(button){
      button.classList.remove('blink');
      button.classList.add('active');
    }

    if(!masterStartTime){
      masterStartTime = startTime;
      masterLoopDuration = sound.buffer.duration;
      masterLoopName = name;
    }
  }, (startTime-audioCtx.currentTime)*1000);
}

// Stop a loop
function stopLoop(name){
  const sound = sounds[name];
  if(!sound || !sound.source) return;
  sound.source.stop();
  sound.source = null;

  const btnId = soundToButton[name];
  const button = btnId ? document.getElementById(btnId) : null;
  if(button) button.classList.remove('active','blink');

  const row = buttonRows[btnId];
  if(rowActive[row] === name) rowActive[row] = null;

  if(masterLoopName === name){
    masterLoopName = null;
    masterStartTime = null;
    masterLoopDuration = null;
  }
}

// Toggle a loop
function toggleLoop(name,buttonId){
  if(audioCtx.state === 'suspended') audioCtx.resume();
  const sound = sounds[name];
  if(!sound) return;

  const row = buttonRows[buttonId];

  // Stop if already playing
  if(sound.source){
    stopLoop(name);
    return;
  }

  // Stop any other loop in same row
  const current = rowActive[row];
  if(current) stopLoop(current);

  startLoop(name,buttonId);
}

// Load sounds and bind buttons
window.addEventListener("load",async()=>{
  for(let i=1;i<=25;i++){
    try{
      await loadSound("sound"+i,"sound"+i+".wav");
      soundToButton["sound"+i]="btn"+i;
    }catch(e){console.warn("Missing sound"+i);}
    const btn = document.getElementById("btn"+i);
    if(btn) btn.onclick=()=>toggleLoop("sound"+i,"btn"+i);
  }
});
