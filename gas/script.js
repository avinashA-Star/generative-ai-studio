const $ = id => document.getElementById(id);
const store = {
  get(k){ try{return localStorage.getItem(k)}catch(e){return null} },
  set(k,v){ try{localStorage.setItem(k,v)}catch(e){} }
};

// Restore saved settings
["base","key","chatModel","imgModel"].forEach(id => {
  const v = store.get("gas_"+id); if (v) $(id).value = v;
  $(id).addEventListener("input", () => store.set("gas_"+id, $(id).value));
});
$("temp").addEventListener("input", () => $("tv").textContent = $("temp").value);

// Tabs
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", x === t));
  ["chat","text","image"].forEach(id => $(id).hidden = id !== t.dataset.tab);
}));

// API helper
async function api(path, body){
  const key = $("key").value.trim();
  if (!key) throw new Error("Enter your API key in the Connection panel.");
  const res = await fetch($("base").value.replace(/\/$/,"") + path, {
    method: "POST",
    headers: {"Content-Type":"application/json","Authorization":"Bearer "+key},
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || ("Request failed (" + res.status + ")"));
  return data;
}
const complete = messages => api("/chat/completions", {
  model: $("chatModel").value, messages, temperature: parseFloat($("temp").value)
}).then(d => d.choices[0].message.content);

// Chat
const history = [{role:"system", content:"You are a helpful assistant."}];
function bubble(cls, text){
  const d = document.createElement("div");
  d.className = "msg " + cls; d.textContent = text;
  $("log").appendChild(d); $("log").scrollTop = $("log").scrollHeight; return d;
}
async function sendChat(){
  const text = $("chatIn").value.trim(); if (!text) return;
  $("chatIn").value = ""; bubble("user", text); history.push({role:"user", content:text});
  const wait = bubble("ai", "Thinking..."); $("chatBtn").disabled = true;
  try {
    const reply = await complete(history);
    history.push({role:"assistant", content:reply}); wait.textContent = reply;
  } catch(e){ wait.textContent = e.message; wait.classList.add("err"); history.pop(); }
  $("chatBtn").disabled = false;
}
$("chatBtn").addEventListener("click", sendChat);
$("chatIn").addEventListener("keydown", e => { if (e.key === "Enter") sendChat(); });

// Writer
$("textBtn").addEventListener("click", async () => {
  const topic = $("topic").value.trim(); if (!topic) return;
  const out = $("textOut"); out.classList.remove("err"); out.textContent = "Generating..."; $("textBtn").disabled = true;
  try { out.textContent = await complete([{role:"user", content: $("tpl").value + " " + topic}]); }
  catch(e){ out.textContent = e.message; out.classList.add("err"); }
  $("textBtn").disabled = false;
});
$("copyBtn").addEventListener("click", () => navigator.clipboard?.writeText($("textOut").textContent));

// Images
$("imgBtn").addEventListener("click", async () => {
  const prompt = $("prompt").value.trim(); if (!prompt) return;
  const out = $("imgOut"); out.classList.remove("err"); out.textContent = "Creating image..."; $("imgBtn").disabled = true;
  try {
    const d = await api("/images/generations", {model:$("imgModel").value, prompt, n:1, size:$("size").value});
    const item = d.data[0]; const img = new Image(); img.alt = prompt;
    img.src = item.url || ("data:image/png;base64," + item.b64_json);
    out.textContent = ""; out.appendChild(img);
  } catch(e){ out.textContent = e.message; out.classList.add("err"); }
  $("imgBtn").disabled = false;
});
