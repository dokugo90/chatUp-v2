import React, { useState, useRef, useEffect } from 'react';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    setDoc,
    updateDoc,
    doc,
    serverTimestamp,
    Timestamp,
    deleteDoc,
    startAfter,
  } from 'firebase/firestore';

export default function MessageCard(props) {
    const linkRegex = /\b(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]/;
    const emailRegex = /^\S+@\S+\.\S+$/;
    const [messageOptions, showMessageOptions] = useState(false);
    const [renameShow, setShowRename] = useState(false);
    const theme = props.theme;
    const chats = props.chats;
    const pathRoom = props.pathRoom;
    const pathId = props.pathId;
    const id = props.id;
    const messageList = props.messages;
    const [overlayThree, setOverlayThree] = useState(false);
    const [newMessage, setNewMessage] = useState("");

    function handleDeleteMessage() {
        const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const userRoomDocRef = doc(usersRoomsRef, pathRoom);
    const userRoomSubcollection = collection(userRoomDocRef, `${chats[pathId].roomId}`);
    const userRoomSubcollectionDocRef = doc(userRoomSubcollection, id)

    deleteDoc(userRoomSubcollectionDocRef).catch((err) => {
        alert("Try again")
    });

    const lastMessage = `${props.sender} deleted message`

    updateDoc(userRoomDocRef, {
        lastMessage: lastMessage,
        lastMessageTime: props.time(),
      })
    .catch((err) => {
      alert("Try Again");
    });
    }

    /*function handleEditMessage() {
        const firestore = getFirestore();
        const documentRef = doc(firestore, `rooms/AllRooms`);
        const usersRoomsRef = collection(documentRef, `userRooms`);
        const userRoomDocRef = doc(usersRoomsRef, pathRoom);
        const userRoomSubcollection = collection(userRoomDocRef, `${chats[pathId].roomId}`);
        const userRoomSubcollectionDocRef = doc(userRoomSubcollection, id);

        const regex = /^\s*$/;

        if (!regex.test(newMessage)) {
            updateDoc(userRoomSubcollectionDocRef, {
                message: newMessage.trim(),
              })
              .then(() => {
                handleRenameModal()
              })
            .catch((err) => {
              alert("Try Again");
            });

            const lastMessage = `${props.sender} edited message`
            updateDoc(userRoomDocRef, {
                lastMessage: lastMessage,
                lastMessageTime: props.time(),
              })
            .catch((err) => {
              alert("Try Again");
            });
        } else {
            alert("New message must have characters")
        }
    }*/

    /*function handleRenameModal() {
        if (!renameShow) {
          setShowRename(true)
          setOverlayThree(true)
        } else {
          setShowRename(false)
          setOverlayThree(false);
          setNewMessage("");
        }
      }*/

    return (
        <>
        {
        /*renameShow ?
        <>
          <div className='rename-modal-flex'>
            <div style={{backgroundColor: theme ? "white" : "#555", boxShadow: theme ? "0px 10px 10px #555" : ""}} className='rename-modal'>
          <input style={{backgroundColor: theme ? "rgba(0, 0, 0, 0.3)" : "#242424", color: theme ? "black" : "white"}} maxLength="20" minLength="2" onChange={e => setNewMessage(e.target.value)} className='chat-name-input' type="text" placeholder='New Message'></input>
          <div className='public-btns-flex'>
                <button onClick={() => handleRenameModal()} className='cancel-public-btn'>CANCEL</button>
                <button onClick={() => handleEditMessage()} className='create-public-btn'>EDIT</button>
              </div>
              </div>
          </div>
        </>
        : 
        <>

        </>*/
      }
      {
           /* overlayThree ?
            <div onClick={() => handleRenameModal()} className='overlay'></div>
            : <></> */
          }
        {
            props.CurrentEmail == props.senderEmail ?
            <div onMouseOver={() => showMessageOptions(true)} onMouseLeave={() => showMessageOptions(false)} className='message-card-you'>
                 {
                messageOptions ?
                <>
                    <div className='message-options-flex'>
                    <div className='message-options'>
                    <button title='Delete Message' className='message-btn' onClick={() => handleDeleteMessage()}><i style={{fontSize: 16, color: 'red'}} className='material-icons'>delete</i></button>
                    </div>
                    </div>
                </>
                :<></>
                }
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