import React from "react"
import ReactDOM from "react-dom"
import ContentScript from "./ContentScript"
import {
    createBoxContainer, getLocalStorageElems,
    USER_LOGINS_KEY, USER_SETTINGS_KEY,
    getPageDomElem, makeUniqueBoxId,
    interfaceTargetDomId, browser
} from '../utils/utils'


//#region Global fields
/**
 * 
 */

const url = document.location.href

//#endregion



//#region Handle new page
/**
 * Injects existing boxes & comments if any
 */

const createBoxRoot = (boxId, parentDomElem) => {
    // create box container and find parent dom elem
    var boxContainerDomElem = createBoxContainer(boxId)
    parentDomElem.append(boxContainerDomElem);

    // mark them so we know they hold a box
    parentDomElem.style.setProperty('--remodmarker', 'marked')
    boxContainerDomElem.style.setProperty('--remodmarker', 'marked')
    // parentDomElem.style.remodmarker = 'marked'
    // boxContainerDomElem.style.remodmarker = 'marked'

    boxContainerDomElem.setAttribute("id", boxId)

    return ReactDOM.createRoot(boxContainerDomElem)
}

const renderBox = (parentDomElem, boxArgs) => {
    const root = createBoxRoot(boxArgs.boxId, parentDomElem)

    root.render(
        <React.StrictMode>
            <ContentScript {...boxArgs} />
        </React.StrictMode>
    );
}


const injectBox = (boxObject, user) => {
    var target = boxObject.target
    var comments = boxObject.comments
    var parentDomElem = getPageDomElem(target)
    const boxArgs = {boxId: boxObject.boxId, target, user,
         existingComments: comments, allShowing: false}
    renderBox(parentDomElem, boxArgs)
}


const handleBox = async (boxId, user) => {
    let isBoxInPage = document.getElementById(boxId)
    if (isBoxInPage) {
        console.log(`FROM STORAGE: box ${boxId} already in page`)
        return 
    }
    console.log(`INJECTING FROM HANDLEBOXSTORAGE: box ${boxId}`)

    const boxStorage = await getLocalStorageElems(boxId)
    if (!(Object.keys(boxStorage).length > 0)) return;

    injectBox(boxStorage[boxId], user)
}

// waits for document to load and injects boxes
const handleStorage = (boxIdList, user) => {
    document.onreadystatechange = () => {
        if (document.readyState === 'complete') {
            boxIdList.forEach(boxId => handleBox(boxId, user))
        }
    }
}

// runs once as soon as possible
const handleNewPage = async () => {
    const user = await getLocalStorageElems(USER_LOGINS_KEY)
    var urlStorage = await getLocalStorageElems(url)
    let somethingInStorage = (Object.keys(urlStorage).length > 0)
    somethingInStorage
        ? handleStorage(urlStorage[url], user[USER_LOGINS_KEY])
        : console.info(`Nothing for url: ${url}`)
}
handleNewPage()

//#endregion


//#region Insert new boxes on background message
/**
 * 
 */

const handleMessage = (request, sender, sendResponse) => {
    if (request.type === "newBoxFetched") {
        // check if box already on page
        let boxObject = request.data.boxObject
        let isBoxInPage = document.getElementById(boxObject.boxId)
        if (!isBoxInPage) {
            console.log(`INJECTING FROM HANDLEMESSAGE: box ${boxObject.boxId}`)
            injectBox(boxObject, request.data.user)
        } else {
            console.log(`FROM HANDLEMESSAGE: box ${boxObject.boxId} already in page`)
        }
        sendResponse()
    }
    return true
}


 browser.runtime.onMessage.addListener(handleMessage)
//#endregion



//#region Insert new boxes on user click
/**
 * 
 */

const handleMouseUp = async (mouseEvent) => {
    var parentDomElem = mouseEvent.target
    var userSettings = await getLocalStorageElems(USER_SETTINGS_KEY)
    var isWriteOn = userSettings[USER_SETTINGS_KEY].write
    var modified = false
    if (isWriteOn) {
        // let isMarked = parentDomElem.style.remodmarker
        let remodMark = window.getComputedStyle(parentDomElem).getPropertyValue("--remodmarker").trim()
        if (!remodMark) {
            // mark it
            parentDomElem.style.backgroundColor = "rgb(255, 51, 85, 0.2)"
            modified = true
            var boxId = makeUniqueBoxId()
            var user = await getLocalStorageElems(USER_LOGINS_KEY)
            try {
                // make target from domelem for box saving & future injection
                const target = interfaceTargetDomId(parentDomElem)
                const boxArgs = {boxId, target, user: user[USER_LOGINS_KEY], allShowing: true}
                renderBox(parentDomElem, boxArgs)
                
            } catch (err) {
                console.error("rendering new box", err)
            }
        }
        else if (remodMark !== 'remod-native') {
            parentDomElem.style.backgroundColor = "rgb(68, 51, 238, 0.2)"
            modified = true
        }
        if (modified) {
            // revert to original background on mouse out
            parentDomElem.addEventListener("mouseout", () => {
                parentDomElem.style.backgroundColor = "revert"
            })
        }
    } else {
        console.log("write mode off")
    }
}


window.document.addEventListener("mouseup", handleMouseUp)

// const boxProps = {
//     boxId: boxId,
//     target: boxStorage[boxId].target,
//     comments: comments,
//     logInState: user.isLoggedIn,
//     userIdFromStorage: user.userId,
// }
// root.render(
//     <React.StrictMode>
//         <ContentScript {... boxProps}/>
//     </React.StrictMode>
//   );


//#endregion