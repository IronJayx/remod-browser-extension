import {
    browser, LOGS_KEY, USER_LOGINS_KEY,
    USER_SETTINGS_KEY, getLocalStorageElems,
    sendMessageToTab, postToStorage, updateUrlStorage, clearStorage,
    testServer, postToServer, fetchByUrl, routes
} from '../utils/utils'


/** Background script is responsible for:
 * 
 * Initialising app vars in browser.storage
 * Posting new comments to the server
 * Fetching comments for a new url loaded
 * Keeping logs of the app's activity
 * 
 */



//#region Handler for install & initialisation
/**
 * 
 */
const handleInit = async () => {
    console.info("Remod init")
    // clean all locally remod saved elements (if any)
    await clearStorage(LOGS_KEY);
    // init empty log folder
    postToStorage({ [LOGS_KEY]: [] })
    // init user id & password
    postToStorage({
        [USER_LOGINS_KEY]: {
            isLoggedIn: false,
            userId: "",
            passWord: ""
        }
    })
    // init write & read modes
    postToStorage({
        [USER_SETTINGS_KEY]: {
            read: true,
            write: false
        }
    })
    // test if server is working
    testServer()
}

browser.runtime.onInstalled.addListener(handleInit)
//#endregion

//#region Handler for new message
/**
 * 
 */


const handleMessage = (request, sender, sendResponse) => {
    if (request.type === "newCommentPosted") {
        postToServer(routes.postNewCom, request.data).then(sendResponse)
    } else if (request.type === "logUserIn") {
        postToServer(routes.logInUser, request.data).then(sendResponse)
    } else if (request.type === "registerNewUser") {
        postToServer(routes.registerUser, request.data).then(sendResponse)
    }
    return true
}

browser.runtime.onMessage.addListener(handleMessage);

//#endregion

//#region Handler for new page loaded
/**
 * 
 */
const commentsToLocalStorageFormat = (data) => {
    var boxesStorage = {}

    data.forEach(comment => {
        if (!Object.keys(boxesStorage).includes(comment.boxId)) {
            boxesStorage[comment.boxId] = {
                boxId: comment.boxId, target: comment.target, comments: [comment], lastComId: ""
            }
        } else {
            boxesStorage[comment.boxId].comments.push(comment)
        }
    })
    return boxesStorage
}

// const handleDomLoaded = function(details){
//     console.log("handleDomLoaded ARGS", details, this.tellContent, this.messageData)
//     if ((details.tabId == this.tellContent.tabId) && (details.url == this.tellContent.url)) {
//         sendMessageToTab(this.tellContent.tabId, "newBoxFetched", this.messageData)
//         // clean listener
//         browser.tabs.onUpdated.removeListener(handleDomLoaded)
//     }
// }   



const saveChilds = function(data, tellContent=false) {
    
    Object.entries(data).forEach(async (entry) => {
        const [boxId, boxObject] = entry
        postToStorage({[boxId]: boxObject})
        updateUrlStorage(tellContent.url, boxId)
        // if page has not finished loading, message is not sent
        // its ok bc then the page should pick up the box data from storage
        if (tellContent) {
            var messageData = {boxObject: boxObject, user: tellContent.user}
            if (tellContent.finishedLoading === "complete") {
                console.log("SENDING to tab complete (loaded in time")
                sendMessageToTab(tellContent.tabId, "newBoxFetched", messageData)
            } else {
                // wait for domcontenttoload & send
                console.log("REGISTERING handleDomLoaded")
                
                const handleDomLoaded = (details) => {
                    console.log("ARGS: ", details.tabId, tellContent.tabId, messageData)
                    if ((details.tabId === tellContent.tabId) && (details.url === tellContent.url)) {
                        sendMessageToTab(tellContent.tabId, "newBoxFetched", messageData)
                        // clean listener
                        browser.tabs.onUpdated.removeListener(handleDomLoaded)
                        console.log("REMOVED handleDomLoaded")
                    }
                }

                browser.webNavigation.onDOMContentLoaded.addListener(
                    handleDomLoaded, {url: [{urlContains: tellContent.url}]})
            }
        }    
    })
}


const handleNewTab = async (tabId, changeInfo, tabInfo) => {
    // run only once for new urls
    if (!tabInfo.url) console.log("undefined taburl");
    if (!changeInfo.url) return;

    const data = await fetchByUrl(changeInfo.url)
    if (!data) return;

    const boxesStorage = commentsToLocalStorageFormat(data)

    console.log("found boxes: ", Object.keys(boxesStorage))

    var user = await getLocalStorageElems(USER_LOGINS_KEY)

    saveChilds(boxesStorage, {tabId, user: user[USER_LOGINS_KEY], url: changeInfo.url,
        finishedLoading: changeInfo.status })
}

if (!browser.tabs.onUpdated.hasListener(handleNewTab)) {
    console.log("adding listener for tab")
    browser.tabs.onUpdated.addListener(handleNewTab)
}

//#endregion

//#region Handler for logging storage changes 
/**
 * 
 */
// const handleStorage = async (changes, area) => {
//     const changedItems = Object.keys(changes);
//     for (const item of changedItems) {
//         if (item == "remodLogs") {
//         }
//     }
// }

// browser.storage.onChanged.addListener(handleStorage)
//#endregion
