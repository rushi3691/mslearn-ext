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


async function startTimer() {
  // if url contains #completion, then return
  // if (window.location.href.includes('#completion')) {
  //   sendMsg('module completed')
  //   console.log('Completion found');
  //   return;
  // }


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
    }
    else if (title.includes('knowledge')) {
      sendMsg('knowledge found');
      console.log('Knowledge found');
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
  let timeInSeconds = parseInt(time) * 60;
  console.log("parsed time: ", timeInSeconds);

  //click add additional time randomly between 0 to 70 seconds
  const randomExtraTimeInSeconds = Math.floor(Math.random() * 70);
  timeInSeconds += randomExtraTimeInSeconds;

  // 10 seconds for testing
  // timeInSeconds = 10;

  console.log("total time: ", timeInSeconds, " seconds");

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

    // console.log('Time left:', remainingTime); // Log the time left

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

function getPageType() {
  // https://learn.microsoft.com/en-us/training/paths/azure-fundamentals-describe-azure-architecture-services/
  const urlRegex = /https:\/\/learn\.microsoft\.com\/([\w-]+)\/training\/(modules|paths)\/([\w-]+)\/$/;
  const url = window.location.href;
  const match = url.match(urlRegex);
  // console.log(match);
  // if match then return start page
  if (match) {
    return 'start';
  }
  // if #completion then return completion page
  if (url.includes('#completion')) {
    return 'completion';
  }
  // if #exercise then return exercise page
  if (url.includes('#exercise')) {
    return 'exercise';
  }
  // if #knowledge then return knowledge page
  if (url.includes('#knowledge')) {
    return 'knowledge';
  }
  // if #quiz then return quiz page
  // if (url.includes('#quiz')) {
  //   return 'quiz';
  // }
  // if #module then return module page
  // if (url.includes('#module')) {
  //   return 'module';
  // }

}

function handleStartPage() {
  sendMsg('new module started');
  // #start-path or #start-unit
  const timer = new WorkerInterval(() => {
    const startPathButton = document.querySelector('#start-path');
    if (startPathButton !== null) {
      console.log('Start path button found');
      startPathButton.click();
      timer.stop();
    }
    const startUnitButton = document.querySelector('#start-unit');
    if (startUnitButton !== null) {
      console.log('Start unit button found');
      startUnitButton.click();
      timer.stop();
    }

  }, 1000);
}

function handleCompletionPage() {

  sendMsg('module completed');

  // #next-unit-link
  const timer = new WorkerInterval(() => {
    const continueButton = document.querySelector('#next-unit-link');

    if (continueButton !== null) {
      console.log('Continue button found');
      // until dom changes, keep clicking the button  
      continueButton.click();
      // timer.stop();
    }
  }, 1000);

  window.addEventListener('beforeunload', () => {
    console.log("Unloading page")
    timer.stop();
  });
}



const default_state = { auto_start: false, auto_continue: false };

async function getState(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, function (result) {
      if (chrome.runtime.lastError) {
        // Reject the promise with the last error
        reject(chrome.runtime.lastError);
      } else {
        if (result[key] === undefined) {
          console.log('State not found');
          console.log('Creating state:', default_state);
          // State not found, create it
          chrome.storage.local.set({ [key]: default_state }, function () {
            if (chrome.runtime.lastError) {
              // Reject the promise with the last error
              reject(chrome.runtime.lastError);
            } else {
              // Resolve the promise with the default state
              resolve({ ...default_state });
            }
          });
        } else {
          // Resolve the promise with the result
          resolve(result[key]);
        }
      }
    });
  });
}


async function updateState(key, newState) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: newState }, function () {
      if (chrome.runtime.lastError) {
        // Reject the promise with the last error
        reject(chrome.runtime.lastError);
      } else {
        // Resolve the promise with the new state
        resolve(newState);
      }
    });
  });
}



async function main() {
  // type of pages: module start, normal page can contain exercise, knowledge, quiz, completion page with next button
  // console.log("tabId: ", window.tabId)
  if (window.tabId === undefined) {
    console.log('Tab id not found');
    return;
  }
  const state = await getState(`${window.tabId}`);
  console.log('State:', state);



  const page_type = getPageType();
  console.log('Page type:', page_type);
  if (page_type === 'start') {
    if (state.auto_start) {
      handleStartPage();
    }
  }
  else if (page_type === 'completion') {
    if (state.auto_continue) {
      handleCompletionPage();
    }
  }
  else {
    startTimer();
  }

}


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === 'startMain') {
    console.log('Starting timer');
    if (timer !== null) {
      console.log('Clearing timer');
      // clearInterval(timer);
      timer.stop();
      clearInterval(clicktimer);
      timer = null;
    }
    await main();
  }
});




