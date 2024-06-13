# <img src="public/icons/icon_48.png" width="45" align="left"> Mslearn AutoCompleter

Auto completes the whole path/module/unit in microsoft learn and waits for the given page reading time. Solves quizzes using gemini API. 

## Build and Install
1. Clone the repository
2. Run `npm install`
4. change API_KEY in src/gemini.js (read the comments in the file to get the API_KEY)
3. Run `npm run build`
4. Open Chrome and go to `chrome://extensions/`
5. Enable Developer mode
6. Click on `Load unpacked` and select the `build` folder

### How to get the API_KEY
1. Go to https://aistudio.google.com/app/apikey
2. Click on "Create API Key"
3. Copy the API key and paste it in the `src/gemini.js` file

## Usage

1. Open the Microsoft Learn path/module/unit link in the browser
2. Click on the extension icon
3. Click on the `auto_start` button (green is on, red is off) (you can turn it off anytime during the auto completion)
4. Refresh the page/tab
5. The extension will auto complete the path and wait for the given time


## Contribution

Suggestions and pull requests are welcomed!.
