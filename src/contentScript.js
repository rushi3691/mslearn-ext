'use strict';

import { fill_quiz_form } from './quiz_form';
import { sendMsg } from './utils';

class WorkerInterval {
  worker = null;
  constructor(callback, interval) {
    const blob = new Blob([`setInterval(() => postMessage(0), ${interval});`]);
    const workerScript = URL.createObjectURL(blob);
    this.worker = new Worker(workerScript);
    this.worker.onmessage = callback;
  }

  stop() {
    this.worker.terminate();
  }
}

// let alarmSound = new Audio('chime.mp3');

// function ring() {
//   alarmSound.play();
// }


const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

let timer = null;
let clicktimer = null;

// function sendMsg(msg) {
//   chrome.runtime.sendMessage({ message: msg });
// }

async function startTimer() {

  // if url contains #completion, then return
  if (window.location.href.includes('#completion')) {
    sendMsg('module completed')
    console.log('Completion found');
    return;
  }


  // #unit-inner-section > h1
  const titleElm = document.querySelector(
    '#unit-inner-section > h1'
  );

  const title = titleElm.textContent?.toLowerCase();
  console.log("Title: ", title);
  {
    if (!title) {
      console.log('Title not found');
      return;
    }
    else if (title.includes('exercise')) {
      sendMsg('exercise found');
      console.log('Exercise found');
      // return;
    }
    else if (title.includes('knowledge')) {
      sendMsg('knowledge found');
      console.log('Knowledge found');
      // return;
    }
  }

  // #unit-inner-section > ul.metadata.page-metadata > li
  const metadata = document.querySelector(
    '#unit-inner-section > ul.metadata.page-metadata > li'
  );

  if (metadata === null) {
    console.log('Metadata not found');
    return;
  }

  console.log(metadata.innerHTML); // "2 minutes"
  // parse the time
  const time = metadata.innerHTML.split(' ')[0];
  console.log(time);
  let timeInSeconds = parseInt(time) * 60;

  // let timeInSeconds = 2; // 10 seconds for testing

  //click add additional time randomly between 1min to 2min in seconds
  const randomExtraTimeInSeconds = Math.floor(Math.random() * 60) + 60;
  timeInSeconds += randomExtraTimeInSeconds;

  // 10 seconds for testing
  // timeInSeconds = 10;

  console.log(timeInSeconds);

  // Create a new HTML element and set its text to the time
  const timeElement = document.createElement('div');
  timeElement.id = 'timeElement'; // Add an id to the timeElement 
  // timeElement.innerHTML = `Extra time: ${randomExtraTimeInSeconds} <br> Time: ${Math.floor(timeInSeconds / 60)} minutes ${timeInSeconds % 60} seconds`;
  timeElement.innerHTML = `Extra time: ${Math.floor(randomExtraTimeInSeconds / 60)} minutes ${randomExtraTimeInSeconds % 60} seconds <br> Time: ${Math.floor(timeInSeconds / 60)} minutes ${timeInSeconds % 60} seconds`;
  timeElement.style.position = 'fixed';
  timeElement.style.bottom = '10px';
  timeElement.style.right = '10px';
  timeElement.style.backgroundColor = 'black';
  timeElement.style.color = 'white';
  timeElement.style.padding = '10px';
  timeElement.style.border = '1px solid black';
  timeElement.style.zIndex = '10000';

  // Append the new element to the body of the page
  document.body.appendChild(timeElement);
  // window.scrollTo(0, document.body.scrollHeight);


  let startTime = performance.now() / 1000; // Get the start time in seconds
  let endTime = startTime + timeInSeconds; // Get the end time in seconds

  // scroll to the top
  // window.scrollTo(0, 0);
  timer = new WorkerInterval(() => {
    window.scrollBy(0, 10); // Scroll by 10px

    let currentTime = performance.now() / 1000; // Get the current time in seconds
    let remainingTime = endTime - currentTime; // Calculate the remaining time

    console.log('Time left:', remainingTime); // Log the time left

    timeElement.innerHTML = `Extra time: ${Math.floor(randomExtraTimeInSeconds / 60)} minutes ${randomExtraTimeInSeconds % 60} seconds <br> 
    Time: ${Math.max(0, Math.floor(remainingTime / 60))} minutes ${Math.max(0, Math.floor(remainingTime % 60))} seconds`; 

    // When the timer ends, show a notification and clear the timer
    if (remainingTime <= 0) {
      timer.stop();

      // chrome.runtime.sendMessage({ message: 'timer ended' });
      sendMsg('timer ended');
      // #next-section > div > div > p > a
      let continueButton = document.querySelector(
        '#next-section > div > div > p > a'
      );

      // for testing
      // continueButton = null;
      if (continueButton === null) {
        sendMsg('continue error')
        console.log('continue button not found');
        fill_quiz_form();
        return;
      }

      continueButton.focus();
      clicktimer = setInterval(() => {
        continueButton.click();
        clearInterval(clicktimer);
      }, 1000);

    }
  }, 1000);

  return timeInSeconds;
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === 'startTimer') {
    console.log('Starting timer');
    if (timer !== null) {
      console.log('Clearing timer');
      // clearInterval(timer);
      timer.stop();
      clearInterval(clicktimer);
      timer = null;
    }
    await startTimer();
  }
});




