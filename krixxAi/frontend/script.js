// API configuration
const API_BASE_URL = 'http://localhost:3001'; // Change this in production

// DOM elements
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Initialize chat
addMessage("ai", "SYSTEM INITIALIZED. READY FOR USER INPUT.");

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Function to send message to our backend
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage("user", message);
    userInput.value = '';
    
    // Show typing indicator
    const typingId = showTypingIndicator();
    
    try {
        // Call our backend API
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        if (data.response) {
            addMessage("ai", data.response);
        } else if (data.error) {
            addMessage("ai", `ERROR: ${data.error}`);
        } else {
            addMessage("ai", "ERROR: Unexpected response from server");
        }
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessage("ai", `NETWORK ERROR: ${error.message}`);
        console.error('Error:', error);
    }
}

// (Rest of the helper functions remain the same as previous version)
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p>${formatText(text)}</p>`;
    
    messageDiv.appendChild(contentDiv);
    chatHistory.appendChild(messageDiv);
    
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function showTypingIndicator() {
    const id = Date.now();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    messageDiv.id = `typing-${id}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    
    contentDiv.appendChild(typingDiv);
    messageDiv.appendChild(contentDiv);
    chatHistory.appendChild(messageDiv);
    
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    return id;
}

function removeTypingIndicator(id) {
    const typingElement = document.getElementById(`typing-${id}`);
    if (typingElement) {
        typingElement.remove();
    }
}

function formatText(text) {
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}