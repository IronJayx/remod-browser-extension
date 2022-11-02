# Remod [BETA]
Engage in social interactions anywhere on the web... with anyone !

## Project
- My idea behind Remod is to make the web more engaging. 
- I believe we can do so by making it more modular, letting anyone add contributions (code, text, designs...) to any web pages and share them with the other participants of the network. 
- This would effectively create a "community-run web over the web" composed of alternative "mods" that Remod-members have created and vetted over specific web pages. 

## Current version
Remod's current version consists of a browser extension that lets you inject comments in any web pages and share it with the rest of the network. When another Remod user loads the web page he will be able to see and react to your comments. 

## See what's up
You can a list of other users activity here -> http://13.38.128.167:5000/


## How to use it
The extension is currently waiting to be published on the Chrome web store (which can take weeks).
If you are familiar with using the terminal you can follow the following steps:

### 1. Clone the repo and generate the build folder with the extension code:
- You first need to have git & node installed. 
- Then:
```
git clone https://github.com/eBoreal/remod-browser-extension.git
cd remod-browser-extension
npm i
npm run build
```

### 2. Load the extension into your chrome browser
- Go to chrome://extensions/
- Turn developer mode on
- Click on "Load unpacked extension" and select the build folder under remod-browser-extension/
- Pin the extension to your taskbar for better user friendliness :)
- Click on extension Icon to create an account and enable view & write modes  


Notes: 
- This is an experimental project I am currently developing on my free time. Any contribution or feedback is welcome. 
- The extension only works on chrome for now. 

