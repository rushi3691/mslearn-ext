import "./popup.css";

const elm = document.getElementById('toggle');

elm.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log(tabs);
        let tab = tabs[0];
        chrome.storage.local.get(`${tab.id}`, (result) => {
            let newState;
            if (result[tab.id]) {
                newState = { auto_start: !result[tab.id].auto_start, auto_continue: !result[tab.id].auto_continue };
            } else {
                newState = { auto_start: false, auto_continue: false };
            }
            chrome.storage.local.set({ [tab.id]: newState }, function () {
                chrome.action.setBadgeText({ tabId: tab.id, text: newState.auto_start ? 'ON' : '' });
                console.log('Value is set to ' + newState.auto_start);
            });
        });
    });

    this.classList.toggle('toggled');

});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];
    chrome.storage.local.get(`${tab.id}`, (result) => {
        if (result[tab.id] && !result[tab.id].auto_start) {
            elm.classList.add('toggled');
        }
        // chrome.action.setBadgeText({ tabId: tab.id, text: result[tab.id] && result[tab.id].auto_start ? 'ON' : '' });
    });
});