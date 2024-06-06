'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages


let urlRegex = /https:\/\/learn\.microsoft\.com\/([\w-]+)\/training\/modules\/([\w-]+)\/.*/;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && urlRegex.test(tab.url)) {
    console.log('Sending message to tab');
    chrome.tabs.sendMessage(tabId, { message: 'startTimer' });
  }
});

function didCreateNotification(notificationId) {
  setTimeout(function () {
    chrome.notifications.clear(notificationId);
  }, 5000); // Clear the notification after 5 seconds
}

function createNotification(msg) {
  var options = {
    type: "basic",
    title: "MSLearn",
    message: msg,
    iconUrl: "icons/icon_48.png",
    priority: 2,
    requireInteraction: false,
    eventTime: Date.now() + 5000 // The notification will vanish after 5 seconds
  }
  chrome.notifications.create("", options, didCreateNotification);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'timer ended') {
    console.log('Timer ended');
  } else if (request.message === 'continue error') {
    console.log('Continue button not found');
    createNotification("Continue button not found");
  } else if (request.message === 'exercise found') {
    console.log('Exercise found');
    createNotification("Exercise found");
  } else if (request.message === 'knowledge found') {
    console.log('Knowledge found');
    createNotification("Knowledge found");
  } else if (request.message === 'module completed') {
    console.log('Module completed');
    createNotification("Module completed");
  } else if (request.message === 'Error in fill_quiz_form') {
    console.log('Error in fill_quiz_form');
    createNotification("Error in fill_quiz_form");
  }
});