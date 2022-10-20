import React, { useState, useEffect } from 'react';
import Toggle from './Toggle'
import {USER_SETTINGS_KEY, postToStorage} from '../../utils/utils'

export default function ControlBox({ userId, readChecked, writeChecked }
) {
  const [isReadChecked, setReadCheck] = useState(readChecked)
  const [isWriteChecked, setWriteCheck] = useState(writeChecked)

  // persist check state
  useEffect(() => {
    postToStorage({[USER_SETTINGS_KEY]: 
      {read: isReadChecked, write: isWriteChecked}
    })
  }, [isReadChecked, isWriteChecked])

  function handleReadCheck() {
    setReadCheck(prevState => !prevState)
  }

  function handleWriteCheck() {
    setWriteCheck(prevState => !prevState)
  }

  const loginText = `logged in as ${userId}`
  return (
    <>
      <span className="LoginText"> {loginText} </span>
      <Toggle toggleLegend="See existing boxes"
        isChecked={isReadChecked} handleCheck={handleReadCheck} />
      <Toggle toggleLegend="Add new box on click"
        isChecked={isWriteChecked} handleCheck={handleWriteCheck} />
    </>
  )
}
