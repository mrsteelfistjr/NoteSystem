/* ------------------- THEMES ------------------- */
const themes = {
  retro: { "--bg-color":"black", "--text-color":"lime", "--accent-color":"lime", "--input-bg":"#111", "--button-bg":"#111", "--font-family":"monospace" },
  white: { "--bg-color":"#fefefe", "--text-color":"#111", "--accent-color":"black", "--input-bg":"#fff", "--button-bg":"#fff", "--font-family":"Arial, sans-serif" },
  blue: { "--bg-color":"#e0f0ff", "--text-color":"#003366", "--accent-color":"#0077cc", "--input-bg":"#cce5ff", "--button-bg":"#cce5ff", "--font-family":"Verdana, sans-serif" },
  pink: { "--bg-color":"#fff0f6", "--text-color":"#c10069", "--accent-color":"#ff4fa2", "--input-bg":"#ffe6f0", "--button-bg":"#ffe6f0", "--font-family":"Comic Sans MS, cursive" },
  amber: { "--bg-color":"#fff8e1", "--text-color":"#bf360c", "--accent-color":"#ff6f00", "--input-bg":"#ffecb3", "--button-bg":"#ffecb3", "--font-family":"Tahoma, sans-serif" },
  purple: { "--bg-color":"#2b003b", "--text-color":"#d0b3ff", "--accent-color":"#9a4dff", "--input-bg":"#3e0057", "--button-bg":"#3e0057", "--font-family":"Verdana, sans-serif" },
  matrix: { "--bg-color":"black", "--text-color":"#00ff00", "--accent-color":"#00ff00", "--input-bg":"#001100", "--button-bg":"#001100", "--font-family":"monospace" },
};
const themeSelector=document.getElementById("themeSelector");
const savedTheme = localStorage.getItem("theme") || "retro";
themeSelector.value=savedTheme;
applyTheme(savedTheme);
themeSelector.addEventListener("change", ()=>{
  const t=themeSelector.value;
  applyTheme(t);
  localStorage.setItem("theme",t);
});
function applyTheme(name){
  Object.entries(themes[name]).forEach(([k,v])=>{
    document.documentElement.style.setProperty(k,v);
  });
}

/* ------------------- HISTORY ------------------- */
let noteHistory = JSON.parse(localStorage.getItem("noteHistory") || "[]");
const historyContainer=document.getElementById("historyContainer");
function saveNoteHistory(text){
  if(!text.trim()) return;
  noteHistory.push({text,date:new Date().toLocaleString()});
  localStorage.setItem("noteHistory",JSON.stringify(noteHistory));
  displayHistory();
}
function displayHistory(){
  historyContainer.innerHTML="";
  noteHistory.forEach(n=>{
    const div=document.createElement("div");
    div.className="historyNote";
    div.textContent=`${n.date}: ${n.text.substring(0,50)}...`;
    div.onclick=()=>addColumn(n.text);
    historyContainer.appendChild(div);
  });
}
displayHistory();

/* ------------------- COLUMNS ------------------- */
const columnsContainer=document.getElementById("columnsContainer");
function addColumn(text=""){
  const col=document.createElement("div"); col.className="column"; col.style.opacity=0;

  // Header
  const header=document.createElement("div"); header.className="column-header";
  const title=document.createElement("span"); title.textContent="New File";
  const delBtn=document.createElement("button"); delBtn.textContent="🗑";
  delBtn.onclick=()=>columnsContainer.removeChild(col);
  header.appendChild(title); header.appendChild(delBtn); col.appendChild(header);

  // Textarea
  const ta=document.createElement("textarea"); ta.value=text;
  col.appendChild(ta);

  // Word count
  const wc=document.createElement("p");
  wc.textContent=`${ta.value.trim().split(/\s+/).filter(Boolean).length} words`;
  col.appendChild(wc);
  ta.addEventListener("input",()=>{ wc.textContent=`${ta.value.trim().split(/\s+/).filter(Boolean).length} words`; });

  columnsContainer.appendChild(col);
  setTimeout(()=>col.style.opacity=1,50);
  saveNoteHistory(text);
}
document.getElementById("addColumnBtn").addEventListener("click",()=>addColumn());

/* ------------------- DOWNLOAD ------------------- */
document.getElementById("downloadBtn").addEventListener("click",()=>{
  let combined="";
  document.querySelectorAll(".column textarea").forEach(ta=>combined+=ta.value+"\n\n");
  const blob=new Blob([combined],{type:"text/plain"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="notes.txt"; a.click();
});

/* ------------------- DICTATION ------------------- */
let recognition;
if("webkitSpeechRecognition" in window){
  recognition=new webkitSpeechRecognition(); recognition.continuous=true; recognition.lang="en-US";
  recognition.onresult=(e)=>{
    const transcript=e.results[e.results.length-1][0].transcript;
    addColumn(transcript);
  };
}
document.getElementById("dictationBtn").addEventListener("click",()=>{
  if(!recognition){alert("Speech recognition not supported."); return;}
  recognition.start();
});

/* ------------------- SUMMARIZER ------------------- */
function summarizeNote(text){
  const sentences=text.split(/(?<=[.!?])\s+/);
  const shortS=sentences.slice(0,Math.ceil(sentences.length/2));
  return shortS.map(s=>s.replace(/\b(the|a|an)\b/gi,"the")).join(" ");
}
document.getElementById("summarizeBtn").addEventListener("click",()=>{
  let combined=""; document.querySelectorAll(".column textarea").forEach(ta=>combined+=ta.value+" ");
  if(!combined.trim()){ alert("No notes to summarize."); return; }
  const summary=summarizeNote(combined);
  addColumn(summary);
});

/* ------------------- QR CODES ------------------- */
let qrCount=parseInt(localStorage.getItem("qrCount")||"0"), maxFreeQR=3;
document.getElementById("qrBtn").addEventListener("click",()=>{
  alert(`Free QR left: ${Math.max(0,maxFreeQR-qrCount)}`);
  if(qrCount>=maxFreeQR && localStorage.getItem("premium")!=="true"){
    alert("Free QR limit reached. Upgrade for unlimited QR codes.");
    return;
  }
  let combined=""; document.querySelectorAll(".column textarea").forEach(ta=>combined+=ta.value+" ");
  const text=encodeURIComponent(combined);
  const baseURL="https://tinyurl.com/NoteSystem";
  const shareURL=`${baseURL}/view.html?note=${text}`;
  const qrURL="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data="+encodeURIComponent(shareURL);
  const w=window.open(""); w.document.write(`<body style="background:#111;color:lime;font-family:monospace;text-align:center;padding:20px">
    <h2>Scan to open note</h2>
    <img src="${qrURL}">
    <p>Free QR left: ${Math.max(0,maxFreeQR-qrCount-1)}</p>
    <p>Upgrade for unlimited QR, AI summarizer, extra themes.</p>
  </body>`);
  qrCount++; localStorage.setItem("qrCount",qrCount);
});

/* ------------------- PREMIUM SYSTEM ------------------- */
const unlockBtn=document.getElementById("unlockBtn");
const upgradeModal=document.getElementById("upgradeModal");
function openModal(){ upgradeModal.style.display="flex"; }
function closeModal(){ upgradeModal.style.display="none"; }
unlockBtn.addEventListener("click", openModal);

paypal.Buttons({
  style: {layout:'vertical',color:'blue',shape:'rect',label:'pay'},
  createOrder: (data, actions)=>{
    return actions.order.create({ purchase_units:[{ amount:{value:'7.00'}, description:"Premium Upgrade: Unlimited QR + AI features + extra themes"}]});
  },
  onApprove:(data,actions)=>{
    return actions.order.capture().then(details=>{
      alert('Transaction completed by '+details.payer.name.given_name);
      localStorage.setItem("premium","true");
      alert("Premium features unlocked!");
    });
  }
}).render('#paypal-button-container');

/* ------------------- WATCH AD PLACEHOLDER ------------------- */
const adBanner=document.createElement("div");
adBanner.id="adBanner"; adBanner.textContent="📺 Watch ad to unlock premium features!";
adBanner.addEventListener("click",()=>{
  alert("Placeholder: Premium unlocked via ad!");
  localStorage.setItem("premium","true");
});
document.body.appendChild(adBanner);
