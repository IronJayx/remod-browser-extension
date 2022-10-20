import React from 'react'
import Comment from './Comment'

export default function CommentList({ comments, handleUpVote }) {
  return (
    <>
        {comments.map(comment => {
          return <Comment key={comment.id} 
                          comment={comment}
                          handleUpVote={handleUpVote}/>
        })}
    </>
  )
}
