'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages


// let urlRegex = /https:\/\/learn\.microsoft\.com\/([\w-]+)\/training\/modules\/([\w-]+)\/.*/;
const urlRegex = /https:\/\/learn\.microsoft\.com\/([\w-]+)\/training\/(modules|paths)\/.*/;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    args: [tabId],
    func: (id) => {
      window.tabId = id;
    }
  });

  if (changeInfo.status === 'complete' && urlRegex.test(tab.url)) {
    console.log('Sending message to tab');
    chrome.tabs.sendMessage(tabId, { message: 'startMain' });
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
  } else if (request.message === 'new module started') {
    console.log('New module started');
    createNotification("New module started");
  }
});

// tab state 
// `${tab.id}` : {auto_start: false, auto_continue: false}

// chrome.tabs.onCreated.addListener(function (tab) {
//   let state = { auto_start: false, auto_continue: false };
//   chrome.storage.local.set({ [tab.id]: state }, function () {
//     console.log('State initialized for tab ' + tab.id);
//   });
// });

// function updateState(tabId, newState) {
//   chrome.storage.local.set({ [tabId]: newState }, function () {
//     console.log('State updated for tab ' + tabId);
//   });
// }

// function getState(tabId, callback) {
//   chrome.storage.local.get(String(tabId), function (result) {
//     callback(result[tabId]);
//   });
// }

function setBadgeText(tabId, text) {
  chrome.action.setBadgeText({ tabId: tabId, text: text });
}

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  chrome.storage.local.remove(String(tabId), function () {
    console.log('State removed for tab ' + tabId);
  });
});

chrome.action.onClicked.addListener((tab) => {
  console.log('Action clicked');
  // change state 
  chrome.storage.local.get(`${tab.id}`, (result) => {
    console.log(result);
    let newState = { auto_start: !result[tab.id].auto_start, auto_continue: !result[tab.id].auto_continue };
    updateState(tab.id, newState);
    setBadgeText(tab.id, newState.auto_start ? 'ON' : '');
  });
});

