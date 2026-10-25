const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const welcome = $("#welcome");
const conversation = $("#conversation");
const form = $("#chatForm");
const input = $("#messageInput");
const chatList = $("#chatList");
const pageTitle = $("#pageTitle");
const toast = $("#toast");
const fileInput = $("#fileInput");
const fileName = $("#fileName");

let activeChat = "New chat";
let chats = ["Meeting summary", "Team report", "Email drafting", "Task overview", "Document translation"];
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function showConversation() {
  welcome.classList.add("hidden");
  conversation.classList.remove("hidden");
}
function showWelcome() {
  welcome.classList.remove("hidden");
  conversation.classList.add("hidden");
  conversation.innerHTML = "";
}
function setActiveChat(title) {
  activeChat = title;
  pageTitle.textContent = title;
  $$(".chat-item").forEach((item) => item.classList.toggle("active", item.dataset.chat === title));
}

function renderChats() {
  chatList.innerHTML = "";
  chats.forEach((title) => {
    const button = document.createElement("button");
    button.className = "chat-item" + (title === activeChat ? " active" : "");
    button.dataset.chat = title;
    button.innerHTML = '<span>◷</span><span class="chat-title"></span>';
    button.querySelector(".chat-title").textContent = title;
    button.addEventListener("click", () => {
      setActiveChat(title);
      showWelcome();
      $("#sidebar").classList.remove("open");
      showToast(`Opened "${title}" demo conversation`);
    });
    chatList.appendChild(button);
  });
}

function addMessage(text, who) {
  const row = document.createElement("div");
  row.className = `message ${who}`;
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = who === "user" ? "P" : "n";
  const content = document.createElement("div");
  content.className = "message-content";
  content.textContent = text;
  row.append(avatar, content);
  conversation.appendChild(row);
  conversation.scrollTop = conversation.scrollHeight;
  return row;
}

function localReply(prompt) {
  const text = prompt.toLowerCase();
  if (/(hello|hi|hey|namaste)/.test(text)) {
    return "Hey Pratik! 👋 I'm Nova AI, a frontend demo assistant. You can ask me to plan a project, draft content, or explain a coding concept. My replies are currently simulated in JavaScript.";
  }
  if (/(code|html|css|javascript|python|program)/.test(text)) {
    return "Let's break it down step by step:\n\n1. Describe what you want the program to do.\n2. Split it into small, manageable parts.\n3. Build one part at a time and test it.\n4. Read any error message carefully before changing the code.\n\nThis demo doesn't call a real AI model yet, so connect your team's backend/API for real coding answers.";
  }
  if (/(project|hackathon|idea|plan|career)/.test(text)) {
    return "Here's a simple starting plan:\n\n1. **Define the problem:** Who is this for, and what problem are you solving?\n2. **Choose an MVP:** Pick 2–3 features you can finish today.\n3. **Build the interface:** Create the main screen and key user flow.\n4. **Connect the backend:** Send requests to your API and display the results.\n5. **Demo and test:** Prepare one realistic example from start to finish.\n\nTip: get one complete flow working before adding extra features.";
  }
  if (/(email|write|draft|message)/.test(text)) {
    return "I can help structure a clear draft. A useful format is:\n\n**Subject:** A short, specific summary\n\n**Opening:** State why you're writing.\n\n**Main point:** Give the important details in a few sentences.\n\n**Next step:** Explain what you need or what happens next.\n\n**Closing:** Thank the reader and sign off.\n\nFor a real generated draft, connect this interface to your AI backend.";
  }
  return "Thanks for your message! This is the interactive frontend demo, so this reply is generated locally using a few JavaScript rules—not by a real AI model.\n\nYour message was received successfully. To make Nova answer any question intelligently, your team can connect this chat to a backend API. Keep API keys on the server; never put secret keys in frontend JavaScript.";
}

function sendMessage(rawText) {
  const text = rawText.trim();
  if (!text) return;
  showConversation();
  addMessage(text, "user");
  input.value = "";
  resizeInput();
  const typingRow = document.createElement("div");
  typingRow.className = "message assistant";
  typingRow.innerHTML = '<div class="message-avatar">n</div><div class="message-content"><div class="typing"><i></i><i></i><i></i></div></div>';
  conversation.appendChild(typingRow);
  conversation.scrollTop = conversation.scrollHeight;

  if (activeChat === "New chat") {
    activeChat = text.length > 25 ? text.slice(0, 25).trim() + "…" : text;
    pageTitle.textContent = activeChat;
    if (!chats.includes(activeChat)) chats.unshift(activeChat);
    chats = chats.slice(0, 8);
    renderChats();
  }
  setTimeout(() => {
    typingRow.remove();
    addMessage(localReply(text), "assistant");
  }, 700);
}

function resizeInput() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 150) + "px";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});
input.addEventListener("input", resizeInput);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
$("#newChat").addEventListener("click", () => {
  setActiveChat("New chat");
  showWelcome();
  input.value = "";
  fileName.textContent = "";
  $("#sidebar").classList.remove("open");
  input.focus();
});
$$(".suggestion-card").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    resizeInput();
    input.focus();
  });
});
$("#openSidebar").addEventListener("click", () => $("#sidebar").classList.add("open"));
$("#closeSidebar").addEventListener("click", () => $("#sidebar").classList.remove("open"));
$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  showToast(document.body.classList.contains("dark") ? "Dark theme enabled" : "Light theme enabled");
});
$("#searchToggle").addEventListener("click", () => {
  const query = prompt("Search recent chats:");
  if (query === null) return;
  const found = chats.filter((title) => title.toLowerCase().includes(query.toLowerCase()));
  if (!query.trim()) { showToast("Type a word to search chats"); return; }
  if (found.length) {
    renderChats();
    showToast(`Found ${found.length}: ${found.join(", ")}`);
    const match = $$(".chat-item").find((item) => item.dataset.chat === found[0]);
    if (match) match.click();
  } else showToast("No matching chats found");
});
$("#libraryBtn").addEventListener("click", () => showToast("Library is a demo feature for now"));
$("#profileBtn").addEventListener("click", () => showToast("Personal workspace · demo profile"));
$("#clearChats").addEventListener("click", () => {
  if (confirm("Clear the recent chat list?")) {
    chats = [];
    renderChats();
    showToast("Recent chat list cleared");
  }
});
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  fileName.textContent = file ? file.name : "";
  if (file) showToast(`Selected file: ${file.name} (demo only; not uploaded)`);
});
$("#voiceButton").addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("Voice input isn't supported in this browser. Try a recent version of Chrome.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    resizeInput();
    input.focus();
  };
  recognition.onerror = () => showToast("Couldn't capture voice. Check microphone permission.");
  recognition.start();
  showToast("Listening… speak now");
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("#newChat").click();
  }
  if (event.key === "Escape") $("#sidebar").classList.remove("open");
});
renderChats();
