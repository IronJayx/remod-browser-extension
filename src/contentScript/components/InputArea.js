import React from 'react'

export default function InputArea( {newPostTextRef, handleNewPost, adaptInputHeight} ) {
  
  return (
    <div className='InputArea'>
        <textarea ref={newPostTextRef} type="text" className="InputText" 
                  placeholder='Write something' onChange={adaptInputHeight}/>
        <button onClick={handleNewPost} 
                className="InputButton">
                Post
        </button>
    </div>
  )
}
