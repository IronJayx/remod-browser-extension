/*global chrome*/
import * as uuid from 'uuid'

/** This module's goal is to simplify the app's logic understanding
 * 
 * Basically any functions that is re-used across scripts and/or is self-expressed
 * gets put below. 
 * This way scripts containing app logic will be shorter & easier to read.
 * Everything is organised by #region for VsCode foldability :)
 * 
 */


//#region Global vars used across the app
/**
 * Mostly keys for chrome.storage
 */
// browser context
export const browser = chrome
// where keep trace of all data saved to chrome.storage by remod
export const LOGS_KEY = "remod.logs"
// boolean indicating wether users wants to add new boxes
export const USER_LOGINS_KEY = "remod.user.login"
export const USER_SETTINGS_KEY = "remod.settings.state"


//#endregion

//#region Server routes vars
/**
 * Server IP and main routes used to fetch
 */

const SERVERIP = "http://13.38.128.167"
const PORT = ":5000/api/"
export const routes = {
    fetchByUrl: SERVERIP + PORT + "comments/getByUrl/",
    postNewCom: SERVERIP + PORT + "comments/postNew/",
    logInUser: SERVERIP + PORT + "users/login/",
    registerUser: SERVERIP + PORT + "users/register/"
}

//#endregion

//#region Browser API functions
/**
 * Handle different browser contexts
 */
// wrapper to get local storage elements
export const getLocalStorageElems = (storageId) => {
    return browser.storage.local.get(storageId)
}

// Save to local
export const postToStorage = (keyValueObject) => {
    return browser.storage.local.set(keyValueObject)
}

// works for lists (url storage)
export const updateUrlStorage = async (url, updateValue) => {
    console.log("updateUrlStorage")
    var existingData = await getLocalStorageElems(url)
    saveLog(url)
    
    if (Object.keys(existingData).length === 0) {
        console.log(`${updateValue} new under new ${url}`)
        postToStorage({[url]: [updateValue]})
        return 
    } 
    if (existingData[url].includes(updateValue)) {
        console.log(`${updateValue} already at ${url}`)
        return
    }
    console.log(`${updateValue} appended under ${url}`)
    var newValue = [...existingData[url], updateValue]
    postToStorage({[url]: newValue})
}

export const sendMessageToTab = (tabId, msg_type, data) => {    
    console.log("sending to tab: ", msg_type)
    browser.tabs.sendMessage(
        tabId,
        {
            type: msg_type,
            data: data
        }
        ).then(resp => console.log(`resp from content ${resp?.response}`)
        ).catch(err => console.error(err))
}

//#endregion

//#region Box & Comment data functions
/**
 * 
 */

// boxId is how we store & retrieve comment boxes
export const makeUniqueBoxId = () => {
    return uuid.v4()
}

// Interface to handle how we represent target dom elem in storage
// trade off between size and ability to find it back
export const interfaceTargetDomId = (domElem) => {
    // JSON.stringify()
    return {
        innerText: domElem.innerText,
        localName: domElem.localName,
        id: domElem.id
    }
}

// Save retrieved comment to chrome storage
// all comments are saved in a dict {url: {boxId: {comId: commentData, ...}}}
export const saveCommentLocally = async (url, commentList) => {
    var urlStorage = await getLocalStorageElems(url);
    // init if empty
    if (Object.keys(urlStorage).length === 0) {
        urlStorage[url] = {}
    } 
    // store by boxId & comId & replace existing if they are here
    for (let commentData of commentList) {
        if (Object.keys(urlStorage[url]).includes(commentData.boxId.toString())) {
            urlStorage[url][commentData.boxId][commentData.id] = commentData
        } 
        else {
            urlStorage[url][commentData.boxId] = {}
            urlStorage[url][commentData.boxId][commentData.id] = commentData
        }
        
    }
    console.log("saving locally", urlStorage)
    postToStorage(urlStorage);
    saveLog(url);
}


//#endregion

//#region Server fetch functions
/**
 * 
 */
// post the commentdata to server

export const postToServer = async (route, data) => {   
    if (!data) return console.log("Empty data cannot post to: ", route)
    try {
        const res = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        return res.json()
    } catch (err) {
        return { success: false, message: err}
    }
}


export const fetchByUrl = async (url) => {
    let encoded_url = encodeURIComponent(url)
    console.log("fetching for: ", routes.fetchByUrl + encoded_url)
    try {
        const res = await fetch(routes.fetchByUrl + encoded_url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        if (res.ok) return res.json()
        if (res.status === 404) {
            console.log("No comment in db at this url")
            return false
        }
        throw new Error(`HTTP Error : ${res.status}`);
        
    } catch (err) {
        console.error('Url not found: ', err)
        return undefined
    }
}



//#endregion

//#region Helper function for Content script
/**
 * 
 */

// Get url from current page
export const getCurrentPageURl = () => {return document.location.href};

// responsible for implementing method for filtering for dom elems
// returns true or false (match or no match)
export const filterDomMethod = (targetElem, domElem) => {
    // currently matching on innerText
    let matchInnerText = targetElem.innerText;
    return domElem.innerText.includes(matchInnerText)?true:false
}

// Find DOM elem on the page
export const getPageDomElem = (targetElem) => {
    // reduce scope to eleemnts with the same tag
    let domTagElems = document.getElementsByTagName(targetElem.localName);
    // returns first match
    for (let domElem of domTagElems) {
      let match = filterDomMethod(targetElem, domElem);
      if (match) return domElem;
    }
    // if no matching elem default to body
    console.error("Did not find any matching elem");
    return document.querySelector('body');
}

// create comment box container to append to target elem
export const createBoxContainer = (boxId) => {
    let boxContainer = document.createElement('div');
    boxContainer.id = boxId;
    boxContainer.position="relative";
    return boxContainer;
}

//#endregion

//#region Other utils functions
/**
 * 
 */

// not exported bc not used outside
const saveLog = async (url) => {
    var remodLogs = await getLocalStorageElems(LOGS_KEY);
    // if url not in logs append it
    // so we can later retrieve it in storage and delete locally stored content
    if (remodLogs[LOGS_KEY].includes(url)) return;

    // insert & remove old if > 10
    remodLogs[LOGS_KEY].unshift(url)
    while (remodLogs[LOGS_KEY].length > 9) {
        let oldUrl = remodLogs[LOGS_KEY].pop()
        clearStorage(oldUrl)
    }

    postToStorage(remodLogs)
}

// Clear any previous remod data if any
export const clearStorage = async (storageId) => {
    let localStorage = await getLocalStorageElems(storageId);

    // if no childs
    if ((!localStorage) || (Object.keys(localStorage).length === 0)) return;
    // else clean all childs
    let data = localStorage[storageId]

    if (Array.isArray(data)){
        // then its an index
        console.log("clearing all childs for: ", storageId)
        data.forEach(storageId => clearStorage(storageId))
        
    }
    // anyways
    console.log("clearing location: ", storageId)
    clearLocalVar(storageId)
}

export const clearLocalVar = (storageId) => {
    browser.storage.local.remove(storageId)
}

// test server api
export const testServer = () => {
    fetch(SERVERIP + PORT)
        .then(response => response?.json())
        .then(data => console.info("Server working"))
        .catch(err => console.error("server broken", err))
}


//#endregion