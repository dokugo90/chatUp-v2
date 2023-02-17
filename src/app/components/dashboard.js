import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';

export default function Dashboard(props) {

    return (
      <>
      {
        props.roomId == props.currentRoom ?
        <>
        
        <div style={{backgroundColor: props.roomId == props.currentRoom ? "rgba(255, 255, 255, 0.05)" : ""}} key={props.key} className='chat-div'>
                <img className='room-profile' src={props.roomImage}></img>
                <div className='chat-details-flex'>
                  <h3 className='roomname'>{props.roomName}</h3>
                  <div className='lastMessage-info-flex'>
                    <h5>{props.lastMessage}</h5>
                    <div className='lastTime-flex'>
                      <h5 className='lastTime'>{props.lastMessageTime}</h5>
                    </div>
                  </div>
                </div>
              </div>
              
        </>
        : 
        <>
        <Link scroll={false} href="/[id]/[roomid]" as={`/${props.currentIndex}/${props.roomId}`}>
        <div onClick={() => {
          props.messageList.splice(0, props.messageList.length);
         // props.getMessages();
        }} style={{backgroundColor: props.roomId == props.currentRoom ? "rgba(255, 255, 255, 0.05)" : ""}} key={props.key} className='chat-div'>
                <img className='room-profile' src={props.roomImage}></img>
                <div className='chat-details-flex'>
                  <h3 className='roomname'>{props.roomName}</h3>
                  <div className='lastMessage-info-flex'>
                    <h5>{props.lastMessage}</h5>
                    <div className='lastTime-flex'>
                      <h5 className='lastTime'>{props.lastMessageTime}</h5>
                    </div>
                  </div>
                </div>
              </div>
              </Link>
        </>
}
</>
    )
}
