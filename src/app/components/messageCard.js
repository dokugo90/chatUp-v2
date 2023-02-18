import React, { useState, useRef, useEffect } from 'react';

export default function MessageCard(props) {
    return (
        <>
        <div className='message-card'>
            <img className='message-image' src={props.image} ></img>
            <div className='message-info-stack'>
                <p style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='message-sender'>{props.sender} at {props.timesent}</p>
                <p style={{color: props.theme ? "#242424" : "white"}} className='message-text'>{props.message}</p>
            </div>
        </div>
        </>
    )
}