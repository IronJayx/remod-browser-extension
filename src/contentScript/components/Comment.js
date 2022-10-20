import {React, useState} from 'react'

export default function Comment( {comment, handleUpVote} ) {
  var [localUpvotes, incUpvotes] = useState(comment.upvotes)

  function howLongAgo(timeStamp) {
    // should compute howlongago
    if (!timeStamp) return "?"
    var d = new Date(timeStamp)
    return [d.getMonth()+1, d.getDate()].join('/')
  }
    
  function onUpVote(e) {
    // update list & save to db but do not rerender
    handleUpVote(e, comment.id)
    // re-render
    incUpvotes(pastUpvotes => pastUpvotes +=1) 
    console.log(comment.text)
  }
    
  var upvoteText = `upvote (${localUpvotes})`
  const rgb1 = `${comment.rgb1[0]}, ${comment.rgb1[1]}, ${comment.rgb1[2]}`
  const rgb2 = `${comment.rgb2[0]}, ${comment.rgb2[1]}, ${comment.rgb2[2]}`
  return (
    <div>
      <div className="CommentRow">
        <span style= {{background: `radial-gradient(rgb(${rgb1}),rgb(${rgb2}))` }}
              className="UserIcon"/>
        <div className="Comment">
          <div className="Author"> {comment.userId} </div>
          <div className="CommentText"> {comment.text} </div>
          <div> 
            <span className="mini-left-text"> {howLongAgo(comment.timeStamp)}</span>
            <button className="mini-right-text" onClick={onUpVote}> {upvoteText} </button>
          </div>
        </div>
      </div>

      {/* <div className='Border'></div> */}

    </div>

  )
}
