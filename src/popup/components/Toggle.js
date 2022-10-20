import React from 'react'

export default function Toggle( {toggleLegend, isChecked, handleCheck} ) {
  return (
    <div className='Toggle'>
      <span className='ToggleText'> {toggleLegend} </span>
      <label className="switch">
        <input  type="checkbox"
                checked={isChecked}
                onChange={handleCheck}/>
        <span className="slider round"></span>
      </label>
    </div>

  )
}
