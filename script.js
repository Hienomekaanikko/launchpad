const soundToButton = {};
const sounds = {};

window.addEventListener("load", async()=> {
	await loadSound("sound1", "sound1.wav");
	soundToButton("sound1", "btn1");
	document.getElementById("btn1").onclick = () => toggleLoop("sound1", "btn1");

	await loadSound("sound2", "sound2.wav");
	soundToButton("sound2", "sound2.wav");
	document.getElementById("btn1").onclick = () => toggleLoop("sound2", "btn2");

	await loadSound("sound3", "sound3.wav");
	soundToButton("sound3", "sound3.wav");
	document.getElementById("btn1").onclick = () => toggleLoop("sound3", "btn3");

	await loadSound("sound4", "sound4.wav");
	soundToButton("sound4", "sound4.wav");
	document.getElementById("btn1").onclick = () => toggleLoop("sound4", "btn4");

	await loadSound("sound5", "sound5.wav");
	soundToButton("sound5", "sound5.wav");s
	document.getElementById("btn1").onclick = () => toggleLoop("sound5", "btn5");

	await loadSound("sound6", "sound6.wav");
	soundToButton("sound6", "sound6.wav");
	document.getElementById("btn1").onclick = () => toggleLoop("sound6", "btn6");
})
