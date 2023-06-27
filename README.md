# MIAGEGPT

This is a simplified version of OpenAI ChatGPT that uses GPT-3.5 turbo and Dall-E to generate images.

### Setup

Create a file named config.js inside the js directory whit this content
```javascript
export const API_KEY = 'YOUR_API_KEY';
```

### Images generation
Write ```/image ``` and a simple text like 'smiling dog' to send the request to Dall-E
The prompt is passed to GPT-3.5 turbo. It will try to improve your idea.

### Speech to Text
This utility will allow you to speak instead of write your phrases.
1. Press the 'Record' button and allow the access to your mic
2. Speak
3. Stop the record and send it!

NOTE: A bug is present when lauching with Firefox 114.0.2