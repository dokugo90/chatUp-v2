import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'

export default function Dashboard(props) {

    return (
      <>
      {
        props.roomId == props.currentRoom ?
        <>
        
        <div style={{backgroundColor: props.roomId == props.currentRoom ? props.theme ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.05)" : ""}} key={props.key} className='chat-div'>
                <img className='room-profile' src={props.roomImage}></img>
                <div className='chat-details-flex'>
                  <h3 style={{color: props.theme ? "black" : "white"}} className='roomname'>{props.roomName}</h3>
                  <div className='lastMessage-info-flex'>
                    <h5 style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='lastmessage-div-text'>{props.lastMessage}</h5>
                    <div className='lastTime-flex'>
                      <h5 style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='lastTime'>{props.lastMessageTime}</h5>
                    </div>
                  </div>
                </div>
              </div>
              
        </>
        : 
        <>
        <Link prefetch={true} scroll={false} href="/[id]/[roomid]" as={`/${props.currentIndex}/${props.roomId}`}>
        <div onClick={() => {
          props.messageList.splice(0, props.messageList.length);
         // props.getMessages();
        }} style={{backgroundColor: props.roomId == props.currentRoom ? props.theme ? "rgba(0, 0, 0, 1)" : "rgba(255, 255, 255, 0.05)" : ""}} key={props.key} className='chat-div'>
                <img className='room-profile' src={props.roomImage}></img>
                <div className='chat-details-flex'>
                  <h3 style={{color: props.theme ? "black" : "white"}} className='roomname'>{props.roomName}</h3>
                  <div className='lastMessage-info-flex'>
                    <h5 style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='lastmessage-div-text'>{props.lastMessage}</h5>
                    <div className='lastTime-flex'>
                      <h5 style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='lastTime'>{props.lastMessageTime}</h5>
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

export function DashboardClient(props) {
  const router = useRouter();

  const handleChatRoute = () => {
    router.push(
      {
        pathname: '/[id]/[roomId]',
        query: { id: `${props.currentIndex}`, roomId: `${props.roomId}` },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <>
    {
      props.roomId == props.currentRoom ?
      <>
      
      <div style={{backgroundColor: props.roomId == props.currentRoom ? props.theme ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.05)" : ""}} key={props.key} className='chat-div'>
              <img className='room-profile' src={props.roomImage}></img>
              <div className='chat-details-flex'>
                <h3 style={{color: props.theme ? "black" : "white"}} className='roomname'>{props.roomName}</h3>
                <div className='lastMessage-info-flex'>
                  <h5 style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='lastmessage-div-text'>{props.lastMessage}</h5>
                  <div className='lastTime-flex'>
                    <h5 style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='lastTime'>{props.lastMessageTime}</h5>
                  </div>
                </div>
              </div>
            </div>
            
      </>
      : 
      <>
      <div onClick={() => {
        handleChatRoute()
        props.messageList.splice(0, props.messageList.length);
       // props.getMessages();
      }} style={{backgroundColor: props.roomId == props.currentRoom ? props.theme ? "rgba(0, 0, 0, 1)" : "rgba(255, 255, 255, 0.05)" : ""}} key={props.key} className='chat-div'>
              <img className='room-profile' src={props.roomImage}></img>
              <div className='chat-details-flex'>
                <h3 style={{color: props.theme ? "black" : "white"}} className='roomname'>{props.roomName}</h3>
                <div className='lastMessage-info-flex'>
                  <h5 style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='lastmessage-div-text'>{props.lastMessage}</h5>
                  <div className='lastTime-flex'>
                    <h5 style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='lastTime'>{props.lastMessageTime}</h5>
                  </div>
                </div>
              </div>
            </div>
            
      </>
}
</>
  )
}
