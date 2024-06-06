export function sendMsg(msg) {
    chrome.runtime.sendMessage({ message: msg });
}