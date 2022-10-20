import React, { useState, useRef, useEffect } from 'react'
import * as uuid from 'uuid'
import '../styles/Content.css';
import CommentList from './components/CommentList'
import InputArea from './components/InputArea'
import {browser, postToStorage, updateUrlStorage,
   USER_LOGINS_KEY} from '../utils/utils'

const url = document.location.href

function ContentScript({ boxId, target, user, existingComments=[], allShowing=true }) {

  const [comments, setComments] = useState(existingComments)
  const [isLoggedIn, setLogin] = useState(user.isLoggedIn)
  const [userId, setUserId] = useState(user.userId)
  const [passWord, setPassWord] = useState(user.passWord)
  const [showAll, setShow] = useState(true)
  const [mounted, setMount] = useState(false)

  const newPostTextRef = useRef()

  // run once => listen for login changes
  useEffect( () => {
    browser.storage.onChanged.addListener((changes, area) => {
      if (Object.keys(changes).includes(USER_LOGINS_KEY)) updateUser(changes[USER_LOGINS_KEY].newValue)
    })
  }, [])

  useEffect(() => {
    if (!mounted) {
      setMount(true)
      return
    }
    if (comments.length > 0) {
      let lastComment = comments[comments.length-1]
      // write over boxId storage
      postToStorage({[boxId]: {boxId, target, comments, lastComId: lastComment.id}})
      // index boxId under url if not already there
      updateUrlStorage(url, boxId)
      // send last comment to server via background
      postToServer(lastComment)      
      }
    }, [comments])

  async function postToServer(lastComment) {
    browser.runtime.sendMessage({type: "newCommentPosted", data: {...lastComment, passWord}})
  }

  async function updateUser(newUser) {
    setUserId(newUser.userId)
    setLogin(newUser.isLoggedIn)
    setPassWord(newUser.passWord)
  }

  // TODO set colors per user at register time & option to change them after
  function setRandomRgb() {
    let rgbPanel = [[68, 51, 238], [159, 63, 243], [255, 255, 80], [173, 239, 209]]
    let idx = Math.floor(Math.random() * rgbPanel.length)
    return rgbPanel[idx]
  }

  function adaptInputHeight() {
    let elem = newPostTextRef.current
    elem.style.setProperty('height', 0)
    elem.style.setProperty('height', (elem.scrollHeight + "px"))
  }

  function handleNewPost(e) {
    if (!isLoggedIn) {
      alert("You must be logged in to add a comment => Do so via the extension's icon ")
      return
    }
    const text = newPostTextRef.current.value
    if (text == '') return 

    const timeStamp = Date.now()
    const rgb1 = setRandomRgb()
    const rgb2 = setRandomRgb()
    const newComData = { id: uuid.v4(), url, target, boxId,
      text, userId, timeStamp, upvotes:0, rgb1, rgb2 }
    
    setComments(prevComments => {
      return [...prevComments, newComData]
    })
    newPostTextRef.current.value = null
    adaptInputHeight()
  }
  
  function handleUpVote(e, commentId) {
    setComments(prevComments => {
      for (let comment of prevComments) {
        if (comment.id === commentId) {
          comment.upvotes += 1;
        }
      }
      return prevComments
    })
  }

  var commentShowing = showAll ? comments : comments.slice(0,1)
  return (
      <div className="Content">
        <CommentList comments={commentShowing} handleUpVote={handleUpVote}/>
        <InputArea newPostTextRef={newPostTextRef} handleNewPost={handleNewPost} 
                   adaptInputHeight={adaptInputHeight}></InputArea>
      </div>

  )
}

export default ContentScript;