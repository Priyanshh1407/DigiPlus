import { testConnection } from './src/services/aiService.js';

console.log("Testing AI connection...");
testConnection()
  .then(response => {
    console.log("Success! Received response from Gemini.");
  })
  .catch(err => {
    console.error("Failed to connect:", err);
  });
