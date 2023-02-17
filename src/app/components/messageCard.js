import React, { useState, useRef, useEffect } from 'react';

export default function MessageCard(props) {
    return (
        <>
        <div className='message-card'>
            <img className='message-image' src={props.image} ></img>
            <div className='message-info-stack'>
                <p className='message-sender'>{props.sender} at {props.timesent}</p>
                <p className='message-text'>{props.message}</p>
            </div>
        </div>
        </>
    )
}