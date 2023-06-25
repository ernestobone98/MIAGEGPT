import { API_KEY } from './config.js';
import { getImageFromDallE } from './dallE.js';

// Requests to davinci costs 10% of the price of GPT-3.5 per token !!!!
const endpointURL = 'https://api.openai.com/v1/chat/completions';

// for audio
const url = 'https://api.openai.com/v1/audio/transcriptions';
let file;
const model = 'whisper-1';


let outputElement, submitButton, inputElement, historyElement, butonElement, loader;

let mediaRecorder, recordButton, stopButton;
let chunks = [];

window.onload = init;

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    loader = document.querySelector('.loader');
    submitButton.addEventListener('click', processInput);

    inputElement = document.querySelector('input');
    historyElement = document.querySelector('.history');
    butonElement = document.querySelector('button');

    recordButton = document.getElementById('recordButton');
    stopButton = document.getElementById('stopButton');

    recordButton.addEventListener('click', startRecording);
    stopButton.addEventListener('click', stopRecording);

    recordButton.disabled = false;
    stopButton.disabled = true;


    // NOTE: audio is not captured
    // navigator.mediaDevices.getUserMedia({ audio: true })
    //     .then(function (stream) {
    //         mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    //         recordButton.disabled = false;

    //         mediaRecorder.addEventListener('dataavailable', function (event) {
    //             chunks.push(event.data);
    //         });

    //         mediaRecorder.addEventListener('stop', function () {
    //             sendAudioToGPT();
    //         });
    //     })
    //     .catch(function (error) {
    //         console.error('Micro error:', error);
    //     });

    inputElement.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            processInput();
        }
    });
}

function clearInput() {
    inputElement.value = '';
}

function showLoader() {
    loader.classList.add('visible');
    submitButton.querySelector('.image-container').style.display = 'none';
}

function hideLoader() {
    loader.classList.remove('visible');
    submitButton.querySelector('.image-container').style.display = 'block';
}

async function processInput() {
    // document.querySelector('h1').style.display = 'none';
    showLoader();
    var inputElement = document.querySelector('input');

    if (inputElement.value.startsWith('/image ')) {
        console.log('Je génère une image Dall-E avec comme demande : ' + inputElement.value.split('/image ')[1]);
        await improvePrompt(inputElement.value.split('/image ')[1]);

    } else if (inputElement.value.startsWith('/song ')) {
        console.log('je demande une chanson avec comme sujet : ' + inputElement.value.split('/song ')[1]);

    } else {
        console.log("message de gpt-3.5");
        await getResponseFromGPT();
    }
    clearInput();
    // setTimeout(hideLoader, 5000);
    hideLoader();
}

async function getImage(prompt) {
    prompt = prompt.toLowerCase();

    console.log("Imágenes de DALL·E");
    let images = await getImageFromDallE(prompt);
    console.log(images);

    const gridContainer = document.createElement('div');
    gridContainer.classList.add('image-grid');

    images.data.forEach(imageObj => {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');

        const imgElement = document.createElement('img');
        imgElement.src = imageObj.url;
        imgElement.width = 256;
        imgElement.height = 256;

        imageContainer.append(imgElement);
        gridContainer.append(imageContainer);
    });

    outputElement.append(gridContainer);
    inputElement.value = '';
}



async function improvePrompt(prompt) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: "write a prompt for DALL-E with this '" + prompt + "'"
            }],
            max_tokens: 100
        })
    };
    try {
        const response = await fetch(endpointURL, options);
        const data = await response.json();
        console.log(data.choices[0].message.content);
        await getImage(data.choices[0].message.content);
    } catch (error) {
        console.log(error);
    }
}

async function getResponseFromGPT() {
    let prompt = inputElement.value;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: prompt
            }],
            max_tokens: 100
        })
    };
    try {
        const response = await fetch(endpointURL, options);
        const data = await response.json();
        console.log(data);
        const chatGptReponseTxt = data.choices[0].message.content;
        // On cree un element p pour la réponse
        const pElementChat = document.createElement('p');
        pElementChat.textContent = chatGptReponseTxt;
        // On ajoute la réponse dans le div output
        outputElement.append(pElementChat);

        // Ajout dans l'historique sur la gauche
        if (data.choices[0].message.content) {
            const pElement = document.createElement('p');
            pElement.textContent = inputElement.value;
            pElement.onclick = () => {
                inputElement.value = pElement.textContent;
            };
            historyElement.append(pElement);
        }
    } catch (error) {
        console.log(error);
    }
}

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.addEventListener('dataavailable', function (event) {
                chunks.push(event.data);
            });

            mediaRecorder.start();

            // Habilitar/deshabilitar botones u otras acciones relacionadas con la grabación
            recordButton.disabled = true;
            stopButton.disabled = false;
        })
        .catch(function (error) {
            console.error('Micro error:', error);
        });
}

async function stopRecording() {
    mediaRecorder.stop();

    // Habilitar/deshabilitar botones u otras acciones relacionadas con la grabación
    recordButton.disabled = false;
    stopButton.disabled = true;

    const audioBlob = new Blob(chunks, { type: 'audio/webm' });

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', model);
    console.log(audioBlob);

    await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${API_KEY}`,
        },
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            // write the response in outputElement
            outputElement.append(data.text);

        })
        .catch((error) => {
            console.error('Error in audio:', error);
        });
}