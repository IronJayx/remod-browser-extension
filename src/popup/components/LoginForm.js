import React from 'react'

export default function LoginForm({ loginRef, passWordRef,
  handleLogin, handleRegister }) {
  

  return (
    <>
      <input ref={loginRef} type="text"
        className="InputText"
        placeholder='User Name'>
      </input>
      <input ref={passWordRef} type="password"
        className="InputText"
        placeholder='Password'>
      </input>
      <button onClick={handleLogin}
        className="LoginButton">
        Log In
      </button>
      <div className="Border">
        New Here ?
      </div>
      <button onClick={handleRegister}
        className="RegisterButton">
        Register
      </button>
    </>
  )
}
