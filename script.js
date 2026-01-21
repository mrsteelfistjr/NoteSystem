/* ----- Elements ----- */
const note = document.getElementById("note");
const counter = document.getElementById("counter");
const qrBtn = document.getElementById("qrBtn");
const downloadBtn = document.getElementById("downloadBtn");
const dictationBtn = document.getElementById("dictationBtn");
const unlockBtn = document.getElementById("unlockBtn");
const themeSelector = document.getElementById("themeSelector");

/* ----- THEME SYSTEM ----- */
const themes = {
  retro: { "--bg-color":"black", "--text-color":"lime", "--accent-color":"lime", "--input-bg":"#111", "--button-bg":"#111", "--font-family":"monospace" },
  white: { "--bg-color":"#fefefe", "--text-color":"#111", "--accent-color":"black", "--input-bg":"#fff", "--button-bg":"#fff", "--font-family":"Arial, sans-serif" },
  blue: { "--bg-color":"#e0f0ff", "--text-color":"#003366", "--accent-color":"#0077cc", "--input-bg":"#cce5ff", "--button-bg":"#cce5ff", "--font-family":"Verdana, sans-serif" }
};

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "retro";
themeSelector.value = savedTheme;
applyTheme(savedTheme);

// Change theme
themeSelector.addEventListener("change", () => {
  const theme = themeSelector.value;
  applyTheme(theme);
  localStorage.setItem("theme", theme);
});

function applyTheme(themeName){
  const t = themes[themeName];
  Object.keys(t).forEach(varName => {
    document.documentElement.style.setProperty(varName, t[varName]);
  });
}

/* ----- LOAD NOTE + AUTO SAVE ----- */
note.value = localStorage.getItem("note") || "";
setInterval(()=>localStorage.setItem("note", note.value), 2000);

/* ----- WORD COUNTER ----- */
note.addEventListener("input", ()=>{
  const words = note.value.trim().split(/\s+/).filter(Boolean);
  counter.textContent = `${words.length} words`;
});

/* ----- DOWNLOAD ----- */
downloadBtn.addEventListener("click", ()=>{
  const blob = new Blob([note.value], {type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "note.txt";
  a.click();
});

/* ----- DICTATION ----- */
let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onresult = (event)=>{
    const transcript = event.results[event.results.length-1][0].transcript;
    note.value += transcript + " ";
  }
}

dictationBtn.addEventListener("click", ()=>{
  if(!recognition){alert("Speech recognition not supported."); return;}
  recognition.start();
});

/* ----- QR LIMIT & SHARE ----- */
let qrCount = parseInt(localStorage.getItem("qrCount") || "0");
const maxFreeQR = 3;

qrBtn.addEventListener("click", ()=>{
  if(qrCount >= maxFreeQR){
    alert("You’ve reached the 3 free QR limit! Use 'Unlock More QR' to add more.");
    return;
  }

  const text = encodeURIComponent(note.value);
  const baseURL = "https://tinyurl.com/NoteSystem";
  const shareURL = `${baseURL}/view.html?note=${text}`;
  const qrURL = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + encodeURIComponent(shareURL);

  const w = window.open("");
  w.document.write(`
    <body style="background:#111;color:lime;font-family:monospace;text-align:center;padding:20px">
      <h2>Scan to open note</h2>
      <img src="${qrURL}">
      <p>Opens instantly on phone 📱</p>
    </body>
  `);

  qrCount++;
  localStorage.setItem("qrCount", qrCount);
});

/* ----- UNLOCK MORE QR PLACEHOLDER ----- */
unlockBtn.addEventListener("click", ()=>{
  const code = prompt("Enter unlock code (example: BUY5) to get 5 more QR codes:");
  if(code === "BUY5"){
    qrCount += 5;
    localStorage.setItem("qrCount", qrCount);
    alert("5 extra QR codes unlocked!");
  } else {
    alert("Invalid code or purchase not completed.");
  }
});
