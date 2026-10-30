# Generative AI Studio

A simple web app for chat, text writing and image generation using any OpenAI-compatible API.

## Files
- index.html - page structure
- style.css  - styling (light and dark mode)
- script.js  - API calls and app logic

## Run
1. Unzip the folder.
2. Open index.html in Chrome, Edge or Firefox.
3. Enter your API key and base URL in the Connection panel.
4. Use the Chat, Writer or Images tab.

## Notes
- Default base URL: https://api.openai.com/v1
- Default models: gpt-4o-mini (text), dall-e-3 (images)
- Settings are stored in your browser's local storage only.
- If a request fails with a network error, run a local server instead:
  python -m http.server 8000  then open http://localhost:8000
