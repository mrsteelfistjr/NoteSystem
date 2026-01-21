const note = document.getElementById("note");
const counter = document.getElementById("counter");
const saveBtn = document.getElementById("saveBtn");
const qrBtn = document.getElementById("qrBtn");
const downloadBtn = document.getElementById("downloadBtn");
const dictationBtn = document.getElementById("dictationBtn");

/* ---------- LOAD ---------- */
note.value = localStorage.getItem("note") || "";

/* ---------- AUTO SAVE ---------- */
setInterval(() => {
  localStorage.setItem("note", note.value);
}, 2000);

/* ---------- WORD COUNTER ---------- */
note.addEventListener("input", () => {
  const words = note.value.trim().split(/\s+/).filter(Boolean);
  counter.textContent = `${words.length} words`;
});

/* ---------- DOWNLOAD NOTE ---------- */
downloadBtn.addEventListener("click", () => {
  const blob = new Blob([note.value], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "note.txt";
  a.click();
});

/* ---------- DICTATION ---------- */
let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    note.value += transcript + " ";
  };
}

dictationBtn.addEventListener("click", () => {
  if (!recognition) {
    alert("Speech recognition not supported.");
    return;
  }
  recognition.start();
});

/* ---------- QR CODE GENERATION ---------- */
qrBtn.addEventListener("click", () => {
  const text = encodeURIComponent(note.value);
  const url = `${location.origin}/view.html?note=${text}`;

  const qrUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" +
    encodeURIComponent(url);

  const qrWindow = window.open("");
  qrWindow.document.write(`
    <h2>Scan to open note</h2>
    <img src="${qrUrl}">
    <p>Works on any phone 📱</p>
  `);
});

/* ---------- KEYBOARD SHORTCUT ---------- */
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    localStorage.setItem("note", note.value);
    alert("Saved");
  }
});
