import React, { useState, useRef, useEffect } from 'react';

export default function MessageCard(props) {
    const linkRegex = /\b(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]/;
    const emailRegex = /^\S+@\S+\.\S+$/;

    return (
        <>
        {
            props.CurrentEmail == props.senderEmail ?
            <div className='message-card-you'>
            <div className='message-info-stack'>
            <p style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='message-sender'>{props.sender}</p>
                {
                    linkRegex.test(props.message) ?
                    <>
                    <div className='user-message-div-flex'>
                    <div className='user-message-div'>
                    <img className='message-image' src={props.image} ></img>
                    <a style={{color: "white"}} className='message-text' href={`${props.message}`} target='_blank' rel="noreferrer">Link -&gt; {props.message}</a>
                    </div>
                    </div>
                    <p style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='message-sender'>{props.timesent}</p>
                    </>
                    : emailRegex.test(props.message) ?
                    <>
                    <div className='user-message-div-flex'>
                    <div className='user-message-div'>
                    <img className='message-image' src={props.image} ></img>
                    <a style={{color: "white"}} className='message-text' href={`mailto:${props.message}`} target='_blank' rel="noreferrer"> Email -&gt; {props.message}</a>
                    </div>
                    </div>
                    <p style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='message-sender'>{props.timesent}</p>
                    </>
                    : 
                    <>
                    <div className='user-message-div-flex'>
                    <div className='user-message-div'>
                    <img className='message-image' src={props.image} ></img>
                    <p className='message-text'>{props.message}</p>
                    </div>
                    </div>
                    <p style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='message-sender'>{props.timesent}</p>
                    </>
                }
            </div>
        </div>
        : 
            <div className='message-card'>
            <div className='message-info-stack'>
                <p style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='message-sender'>{props.sender}</p>
                {
                    linkRegex.test(props.message) ?
                    <>
                    <div className='user-message-div-other-flex'>
                    <div className='user-message-div-other'>
                    <img className='message-image' src={props.image} ></img>
                    <a style={{color: "white"}} className='message-text' href={`${props.message}`} target='_blank' rel="noreferrer">Link -&gt; {props.message}</a>
                    </div>
                    </div>
                    <p style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='message-sender'>{props.timesent}</p>
                    </>
                    : emailRegex.test(props.message) ?
                    <>
                    <div className='user-message-div-other-flex'>
                    <div className='user-message-div-other'>
                    <img className='message-image' src={props.image} ></img>
                    <a style={{color: "white"}} className='message-text' href={`mailto:${props.message}`} target='_blank' rel="noreferrer"> Email -&gt; {props.message}</a>
                    </div>
                    </div>
                    <p style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='message-sender'>{props.timesent}</p>
                    </>
                    : 
                    <>
                    <div className='user-message-div-other-flex'>
                    <div className='user-message-div-other'>
                    <img className='message-image' src={props.image} ></img>
                    <p className='message-text'>{props.message}</p>
                    </div>
                    </div>
                    <p style={{color: props.theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}} className='message-sender'>{props.timesent}</p>
                    </>
                }
            </div>
        </div>
        }
        </>
    )
}