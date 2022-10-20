import React, { useState, useRef, useEffect } from 'react';
import ControlBox from './components/ControlBox';
import LoginForm from './components/LoginForm';
import '../styles/Popup.css';

import {browser, USER_LOGINS_KEY, postToStorage} from '../utils/utils'



function Popup({ logInState, userIdFromStorage, passWordFromStorage,
  readChecked, writeChecked }) {
  const [isLoggedIn, setLogin] = useState(logInState)
  const [userId, setUserId] = useState(userIdFromStorage)
  const [passWord, setPassWord] = useState(passWordFromStorage)
  const [didMount, setMount] = useState(false)

  const loginRef = useRef()
  const passWordRef = useRef()

  function persistLogin() {
    postToStorage({[USER_LOGINS_KEY]: 
      {isLoggedIn: true,
      userId: userId, passWord: passWord}
    })
  }

  useEffect(() => {
    if (!didMount) setMount(true)
    else persistLogin()
  }, [isLoggedIn])


  function containsWhitespace(str) {
    return /\s/.test(str);
  }

  function validateInput() {
    let userId = loginRef.current.value
    let passWord = passWordRef.current.value
    if (userId !== '') {
      let hasWhiteSpace = containsWhitespace(userId)
      if (!hasWhiteSpace) return { success: true, userId: userId, passWord: passWord }
      else return { success: false, message: "userId cannot contain white spaces" }
    } else return { success: false, message: "userId cannot be empty" }
  }

  async function logUserIn(request_type, data) {
    let res = await browser.runtime.sendMessage({type: request_type, data: data})
    if (!res.success) return alert(res.message)
    
    setUserId(data.userId)
    setPassWord(data.passWord)
    setLogin(true)
  }

  function handleLogin() {
    var data = validateInput()
    if (data.success) {
      try {
        logUserIn("logUserIn", data)
      } catch (err) {
        console.error ("handleRegister", err)
      }
    }
    else {
      alert(data.message)  
    } 
  }

  function handleRegister() {
    var data = validateInput()
    if (data.success) {
      try {
        logUserIn("registerNewUser", data)
      } catch (err) {
        console.error ("handleRegister", err)
      }
    }
    else {
      alert(data.message)  
    } 
  }

  try { 
    return (
      <>
        <div className='Popup'>
          {isLoggedIn
            ? <ControlBox userId={userId} readChecked={readChecked}
              writeChecked={writeChecked}  />
            : <LoginForm loginRef={loginRef} passWordRef={passWordRef}
              handleLogin={handleLogin} handleRegister={handleRegister} />
          }
        </div>
      </>
    )
  } catch (err) {
    console.error("Error in render", err)
  }

}
  
export default Popup;