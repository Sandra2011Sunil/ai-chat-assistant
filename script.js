// ── CONVERSATION HISTORY ──
let conversationHistory = [];
let chatSessions = [];

// ── SEND MESSAGE ──
async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text) return;

  // Hide welcome screen
  const welcome = document.querySelector('.welcome');
  if (welcome) welcome.remove();

  // Add user message to screen
  addMessage(text, 'user');

  // Clear input
  input.value = '';
  input.style.height = 'auto';

  // Disable send button
  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true;

  // Add to conversation history
  conversationHistory.push({
    role: "user",
    content: text
  });

  // Save to sidebar history
  if (conversationHistory.length === 1) {
    addToHistory(text);
  }

  // Show typing indicator
  const typingId = showTyping();

  try {
    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: "You are a helpful AI assistant built by Sandra TK, a CSE student at SRMIST. You are knowledgeable about programming, artificial intelligence, IoT, and computer science topics. Keep responses clear, helpful and concise. When explaining code, use simple language suitable for a student.",
        messages: conversationHistory
      })
    });

    const data = await response.json();

    // Remove typing indicator
    removeTyping(typingId);

    // Get AI response
    const aiText = data.content[0].text;

    // Add AI response to screen
    addMessage(aiText, 'ai');

    // Add to conversation history
    conversationHistory.push({
      role: "assistant",
      content: aiText
    });

  } catch (error) {
    removeTyping(typingId);
    addMessage("Sorry, I encountered an error. Please try again!", 'ai');
    console.error('Error:', error);
  }

  // Re-enable send button
  sendBtn.disabled = false;
}

// ── ADD MESSAGE TO SCREEN ──
function addMessage(text, sender) {
  const messages = document.getElementById('messages');

  const div = document.createElement('div');
  div.className = `message ${sender}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = sender === 'user' ? '👩' : '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  // Format text — convert **bold** and newlines
  bubble.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  div.appendChild(avatar);
  div.appendChild(bubble);
  messages.appendChild(div);

  // Scroll to bottom
  messages.scrollTop = messages.scrollHeight;
}

// ── SHOW TYPING INDICATOR ──
function showTyping() {
  const messages = document.getElementById('messages');
  const id = 'typing-' + Date.now();

  const div = document.createElement('div');
  div.className = 'message ai typing';
  div.id = id;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;

  div.appendChild(avatar);
  div.appendChild(bubble);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  return id;
}

// ── REMOVE TYPING INDICATOR ──
function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ── ADD TO SIDEBAR HISTORY ──
function addToHistory(text) {
  const history = document.getElementById('chatHistory');
  const item = document.createElement('div');
  item.className = 'history-item';
  item.textContent = '💬 ' + text.substring(0, 30) + '...';
  history.appendChild(item);
}

// ── NEW CHAT ──
function newChat() {
  conversationHistory = [];
  const messages = document.getElementById('messages');
  messages.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">🤖</div>
      <h2>Hello Sandra! 👋</h2>
      <p>I am your personal AI Assistant. Ask me anything!</p>
      <div class="suggestions">
        <button onclick="sendSuggestion('Explain what is Artificial Intelligence')">
          💡 What is AI?
        </button>
        <button onclick="sendSuggestion('What is Internet of Things IoT?')">
          🌐 What is IoT?
        </button>
        <button onclick="sendSuggestion('Give me tips to crack placement interviews')">
          🎯 Placement Tips
        </button>
        <button onclick="sendSuggestion('Explain LinkedList in Java with example')">
          ☕ Java Help
        </button>
      </div>
    </div>
  `;
}

// ── CLEAR CHAT ──
function clearChat() {
  conversationHistory = [];
  const messages = document.getElementById('messages');
  messages.innerHTML = '';
}

// ── SEND SUGGESTION ──
function sendSuggestion(text) {
  document.getElementById('userInput').value = text;
  sendMessage();
}

// ── HANDLE ENTER KEY ──
function handleKey(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// ── AUTO RESIZE TEXTAREA ──
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}