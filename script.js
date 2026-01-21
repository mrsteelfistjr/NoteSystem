/* Elements */
const columnsContainer = document.getElementById("columnsContainer");
const addColumnBtn = document.getElementById("addColumnBtn");
const qrBtn = document.getElementById("qrBtn");
const downloadBtn = document.getElementById("downloadBtn");
const dictationBtn = document.getElementById("dictationBtn");
const summarizeBtn = document.getElementById("summarizeBtn");
const upgradeBtn = document.getElementById("upgradeBtn");
const themeSelector = document.getElementById("themeSelector");
const historyContainer = document.getElementById("historyContainer");

/* ---------------- THEMES ---------------- */
const themes = {
  retro: { "--bg-color":"black", "--text-color":"lime", "--accent-color":"lime", "--input-bg":"#111", "--button-bg":"#111", "--font-family":"monospace" },
  white: { "--bg-color":"#fefefe", "--text-color":"#111", "--accent-color":"black", "--input-bg":"#fff", "--button-bg":"#fff", "--font-family":"Arial, sans-serif" },
  blue: { "--bg-color":"#e0f0ff", "--text-color":"#003366", "--accent-color":"#0077cc", "--input-bg":"#cce5ff", "--button-bg":"#cce5ff", "--font-family":"Verdana, sans-serif" }
};

const savedTheme = localStorage.getItem("theme") || "retro";
themeSelector.value = savedTheme;
applyTheme(savedTheme);
themeSelector.addEventListener("change", ()=> {
    const theme = themeSelector.value;
    applyTheme(theme);
    localStorage.setItem("theme", theme);
});
function applyTheme(themeName){
    const t = themes[themeName];
    Object.keys(t).forEach(varName => document.documentElement.style.setProperty(varName, t[varName]));
}

/* ---------------- NOTE HISTORY ---------------- */
let noteHistory = JSON.parse(localStorage.getItem("noteHistory") || "[]");
function saveNoteHistory(text){
    noteHistory.push({text,date:new Date().toLocaleString()});
    localStorage.setItem("noteHistory",JSON.stringify(noteHistory));
    displayHistory();
}
function displayHistory(){
    historyContainer.innerHTML="";
    noteHistory.forEach(n=>{
        const div=document.createElement("div");
        div.className="historyNote";
        div.textContent = `${n.date}: ${n.text.substring(0,50)}...`;
        div.onclick = ()=>{ addColumn(n.text); };
        historyContainer.appendChild(div);
    });
}
displayHistory();

/* ---------------- COLUMNS ---------------- */
function addColumn(text=""){
    const col=document.createElement("div");
    col.className="column";
    col.style.opacity=0;
    const ta=document.createElement("textarea");
    ta.value=text;
    col.appendChild(ta);
    const wc=document.createElement("p");
    wc.textContent = `${ta.value.trim().split(/\s+/).filter(Boolean).length} words`;
    col.appendChild(wc);

    ta.addEventListener("input",()=>{
        wc.textContent=`${ta.value.trim().split(/\s+/).filter(Boolean).length} words`;
    });

    columnsContainer.appendChild(col);
    setTimeout(()=>col.style.opacity=1,50);

    // save to history
    saveNoteHistory(text);
}
addColumnBtn.addEventListener("click",()=>addColumn());

/* ---------------- DOWNLOAD ---------------- */
downloadBtn.addEventListener("click",()=>{
    let combined="";
    document.querySelectorAll(".column textarea").forEach(ta=>combined+=ta.value+"\n\n");
    const blob=new Blob([combined],{type:"text/plain"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="notes.txt";
    a.click();
});

/* ---------------- DICTATION ---------------- */
let recognition;
if("webkitSpeechRecognition" in window){
    recognition=new webkitSpeechRecognition();
    recognition.continuous=true;
    recognition.lang="en-US";
    recognition.onresult=(event)=>{
        const transcript = event.results[event.results.length-1][0].transcript;
        addColumn(transcript);
    }
}
dictationBtn.addEventListener("click",()=>{
    if(!recognition){alert("Speech recognition not supported."); return;}
    recognition.start();
});

/* ---------------- SUMMARIZER ---------------- */
function summarizeNote(noteText){
    const sentences = noteText.split(/(?<=[.!?])\s+/);
    const shortSentences = sentences.slice(0, Math.ceil(sentences.length/2));
    const humanized = shortSentences.map(s=>s.replace(/\b(the|a|an)\b/gi,"the")).join(" ");
    return humanized;
}
summarizeBtn.addEventListener("click",()=>{
    let combined="";
    document.querySelectorAll(".column textarea").forEach(ta=>combined+=ta.value+" ");
    if(!combined.trim()){ alert("No notes to summarize."); return; }
    const summary = summarizeNote(combined);
    addColumn(summary);
});

/* ---------------- QR CODES ---------------- */
let qrCount = parseInt(localStorage.getItem("qrCount")||"0");
const maxFreeQR=3;
qrBtn.addEventListener("click",()=>{
    alert(`You have ${Math.max(0,maxFreeQR-qrCount)} free QR codes left`);
    if(qrCount>=maxFreeQR){
        alert("Free QR limit reached. Upgrade to generate more.");
        return;
    }
    let combined="";
    document.querySelectorAll(".column textarea").forEach(ta=>combined+=ta.value+" ");
    const text=encodeURIComponent(combined);
    const baseURL="https://tinyurl.com/NoteSystem";
    const shareURL=`${baseURL}/view.html?note=${text}`;
    const qrURL="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data="+encodeURIComponent(shareURL);
    const w=window.open("");
    w.document.write(`<body style="background:#111;color:lime;font-family:monospace;text-align:center;padding:20px">
        <h2>Scan to open note</h2>
        <img src="${qrURL}">
        <p>Free QR left: ${Math.max(0,maxFreeQR-qrCount-1)}</p>
        <p>Upgrade for unlimited QR, extra themes, summarizer, and humanizer.</p>
    </body>`);
    qrCount++;
    localStorage.setItem("qrCount",qrCount);
});

/* ---------------- UPGRADE WITH PAYPAL ---------------- */
upgradeBtn.addEventListener("click",()=>{
    // replace YOUR_PAYPAL_LINK with your real PayPal.Me link
    window.open("https://www.paypal.com/paypalme/NateWhite540","_blank");
    // after payment, prompt user to unlock manually for now
    const code=prompt("Enter code you received after purchase to unlock premium features:");
    if(code==="PREMIUM"){
        localStorage.setItem("premium","true");
        alert("Premium features unlocked!");
    }
});
