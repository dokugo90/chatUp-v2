import React, { useState, useRef, useEffect } from 'react';

export default function MessageCard(props) {
    const linkRegex = /\b(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]/;
    const emailRegex = /^\S+@\S+\.\S+$/;

    return (
        <>
        <div className='message-card'>
            <img className='message-image' src={props.image} ></img>
            <div className='message-info-stack'>
                <p style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='message-sender'>{props.sender} at {props.timesent}</p>
                {
                    linkRegex.test(props.message) ?
                    <a style={{color: "blue"}} className='message-text' href={`${props.message}`} target='_blank' rel="noreferrer">Link -&gt; {props.message}</a>
                    : emailRegex.test(props.message) ?
                    <a style={{color: "blue"}} className='message-text' href={`mailto:${props.message}`} target='_blank' rel="noreferrer"> Email -&gt; {props.message}</a>
                    : <p style={{color: props.theme ? "#242424" : "white"}} className='message-text'>{props.message}</p>
                     
                }
            </div>
        </div>
        </>
    )
}