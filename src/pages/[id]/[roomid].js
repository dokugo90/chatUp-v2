/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Inter } from '@next/font/google'
import "src/app/globals.css";
import { handleAllUserChats } from '@/utils/allChats';
import { initializeApp } from "firebase/app";
import { firebaseConfig } from 'firebaseconfig';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
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

import Link from 'next/link';
import Dashboard from '@/app/components/dashboard';
import { useRouter } from 'next/navigation'
import MessageCard from '@/app/components/messageCard';
import { DashboardClient } from '@/app/components/dashboard';

export default function chatRoom({ pathId, pathRoom, allChats }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
 const [chats, setChats] = useState(allChats);
 //const chats = useRef(allChats);

  const [filterText, setFilterText] = useState("");
  const [filteredChats, setFilteredChats] = useState(chats);
  const [profilePic, setProfilePic] = useState("");
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [uuid, setuuid] = useState("");
const [return404, setReturn404] = useState(false);
const [loggedIn, setLoggedIn] = useState(false);
const [modal, showModal] = useState(false);
const [publicModal, showPublicModal] = useState(false);
const [overlay, showOverlay] = useState(false);
const [overlayTwo, showOverlayTwo] = useState(false);
const [userRoomName, setUserRoomName] = useState("");
const [currentPath, setCurrentPath] = useState("");
const [ChatOpt, showChatOpt] = useState(false);
const [userMessage, setUserMessage] = useState("");
const [userMessagesList, setUserMessagesList] = useState([]);
//const userMessagesList = useRef([])
const unsubscribeRef = useRef();
const add_btn = useRef();
const [renameShow, setShowRename] = useState(false);
const [overlayThree, setOverlayThree] = useState(false);
const [overlayFour, setOverlayFour] = useState(false);
const [newName, setNewName] = useState("");
const [addUsersModal, showAddUsersModal] = useState(false);

const [usersList, setUsersList] = useState([]);
const [removedUsers, setRemovedUsers] = useState([]);
const [currentRoomId, setCurrentRoomId] = useState();
const [theme, setTheme] = useState(false);
const [hideDashboard, setHideDashboard] = useState("");
const [allMembers, showAllMembers] = useState(false);
const [overlayFive, showOverlayFive] = useState(false);
const [kickModal, showKickModal] = useState(false);
const [overlaySix, showOverlaySix] = useState(false);
const mainBody = useRef();
const dashboard = useRef();
const black = "black";
const white = "white";
const mainColor = "#242424";
const hide_Btn = useRef();

const addedRoomUsers = useRef([

])

const router = useRouter();
const publicStore = getFirestore();

  function Authentication() {
    return {
      signIn: async function() {
        let provider = new GoogleAuthProvider();
        await signInWithPopup(getAuth(), provider)
      },
      authState: async function() {
          onAuthStateChanged(getAuth(), (user) => {
            if (getAuth().currentUser != null) {
              if (typeof window !== 'undefined') {
                localStorage.setItem("loggedInChatUp", true)
                localStorage.setItem("profilePic", getAuth().currentUser.photoURL)
              }
                  setProfilePic(getAuth().currentUser.photoURL)
                  setUsername(getAuth().currentUser.displayName)
                  setEmail(getAuth().currentUser.email);
                  setuuid(getAuth().currentUser.uid)
            } else {
              if (typeof window !== 'undefined') {
                localStorage.setItem("loggedInChatUp", false)
              }
              setProfilePic("")
              setUsername("")
            }
          })
      },
      signOutUser: async function() {
        signOut(getAuth());
        router.refresh()
      }
    }
  }

 useEffect(() => {
    let ignore = false;

    if (!ignore) {
      if (username == "" && localStorage.getItem("loggedInChatUp") == "false") {
        router.push("/")
      }
    }
    return () => {
      ignore = true;
    }
  }, [router]) 

  function handleUsersList() {
    const firestore = getFirestore();
    const document = query(collection(getFirestore(), 'users'), orderBy('createdAccount'))

   unsubscribeRef.current = onSnapshot(document, snapshot => {
      snapshot.docChanges().forEach((change) => {
        if (change.type == "added") {
          usersList.push({
            usersName: change.doc.data().username,
            usersId: change.doc.data().uniqueId,
            pfp: change.doc.data().photo,
            usermail: change.doc.data().email,
          })
        }
      })
    })
  }

  function getTextDate() {
    let messageDate = new Date();
    var hours = messageDate.getHours();
    var minutes = messageDate.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+ minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return `${messageDate.getUTCMonth() + 1}/${messageDate.getUTCDate()} ${strTime}`
   }



  useEffect(() => {
    handleUsersList();
    return () => {
      unsubscribeRef.current();
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!ignore) {
        Authentication().authState()
    }
    return () => {
        ignore = true;
    }
  }, [])
  

  useEffect(() => {
    
    setFilteredChats(chats.filter(item => item.roomName.toLowerCase().includes(filterText.toLowerCase())));
    
  }, [filterText])

  function handle404() {
    if (chats[pathId].roomId != pathRoom) {
      setReturn404(true)
    } else {
      setReturn404(false)
    }
  }

  useEffect(() => {
    let ignore = false;

    if (!ignore) {
      handle404()
    } 

    return () => {
      ignore = true;
    }
  }, [])

  function handleChatPrivacyOptions() {
    if (!modal) {
      showModal(true)
      add_btn.current.classList.add("rotate")
    } else {
      showModal(false)
      add_btn.current.classList.remove("rotate")
    }
  }

  function handlePublicModal() {
    if (!publicModal) {
      showPublicModal(true);
      handleChatPrivacyOptions();
      showOverlay(true)
    } else {
      showPublicModal(false);
      showOverlay(false)
      addedRoomUsers.current = [];
      setUsersList([...usersList, ...removedUsers]);
      setRemovedUsers([]);
      setUserRoomName("")
    }
  }

  function handleChatOptions() {
    if (!ChatOpt) {
      showChatOpt(true)
      showOverlayTwo(true)
    } else {
      showChatOpt(false)
      showOverlayTwo(false)
    }
  }

  function handleAddedUsers() {
    let roomUsers = [];
    for (let i = 0; i < addedRoomUsers.current.length; i++) {

      roomUsers.push({name: `${addedRoomUsers.current[i].usersName}`, email: `${addedRoomUsers.current[i].usersEmail}`, usersId: `${addedRoomUsers.current[i].usersUid}`})

    }
    return roomUsers;
  }

  function createNewRoom() {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const regex = /^\s*$/;


    if (!regex.test(userRoomName) && userRoomName.length >= 2) {
      addDoc(usersRoomsRef, {
        roomName: userRoomName.trim(),
        admin: getAuth().currentUser.uid,
        members: handleAddedUsers(),
        lastMessage: "Chat Created",
        lastMessageTime: getTextDate(),
        createdRoom: serverTimestamp()
      }).then(() => {
        addedRoomUsers.current.splice(0, addedRoomUsers.current.length)
        handlePublicModal();
      }).finally(() => {
        setUserRoomName("");
        setUsersList([...usersList, ...removedUsers]);
        setRemovedUsers([]);
      })
      .catch(error => {
        alert("Try Again");
      });
      /*setTimeout(() => {
        addedRoomUsers.current.splice(0, addedRoomUsers.current.length)
      }, 2000)
      setUsersList([...usersList, ...removedUsers]);
      setRemovedUsers([]);*/
      } else {
        alert("Room name must include a character, and can't be less than 2 characters")
      }
  }

  async function deleteChatRoom() {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const userRoomDocRef = doc(usersRoomsRef, pathRoom);

   await deleteDoc(userRoomDocRef).then(() => {
      router.push("/")
   }).catch((err) => {
    alert("Please try again")
   }) 

  }

  /*
  function handleShowRoomMessages(coll) {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const userRoomDocRef = doc(usersRoomsRef, pathRoom);
    const userRoomSubcollection = query(collection(userRoomDocRef, `${chats[pathId].roomId}`), orderBy("sentMessage"), limit(50));
  
    setUserMessagesList([]);
  
    const unsubscribe = onSnapshot(userRoomSubcollection, snapshot => {
      const user = getAuth().currentUser;
  const { members, admin } = chats[pathId];

  if (!user || (!members.some(member => member.email === user.email) && admin !== user.uid)) {
    setReturn404(true);
    return;
  }
        snapshot.docChanges().forEach((change) => {
          if (change.doc.data().roomId == pathRoom) {
            if (change.type == "added") {
              setUserMessagesList(prevState => [
                ...prevState,
                {
                  sender: change.doc.data().sentBy,
                  textMessage: change.doc.data().message,
                  messageImage: change.doc.data().userImage,
                  sentTime: change.doc.data().time,
                  messageId: change.doc.data().roomId,
                },
              ]);
            }
          }
        });
    });
  
    return unsubscribe;
  }
  */

  function handleShowRoomMessages(coll) {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const userRoomDocRef = doc(usersRoomsRef, pathRoom);
    const userRoomSubcollection = query(collection(userRoomDocRef, `${chats[pathId].roomId}`), orderBy("sentMessage", "desc"), limit(50));
    
    const unsubscribe = onSnapshot(userRoomSubcollection, snapshot => {
      const user = getAuth().currentUser;
      const { members, admin } = chats[pathId];
  
      if (!user || (!members.some(member => member.email === user.email) && admin !== user.uid)) {
        setReturn404(true);
        return;
      }
  
      const messagesList = snapshot.docs.map(doc => ({
        sender: doc.data().sentBy,
        senderEmail: doc.data().sendermail,
        textMessage: doc.data().message,
        messageImage: doc.data().userImage,
        sentTime: doc.data().time,
        messageId: doc.data().roomId,
        id: doc.id,
      }));
  
      setUserMessagesList(messagesList.reverse());
    });
    
    return unsubscribe;
  }
  
  useEffect(() => {
    let unsubscribe;
  
    if (pathRoom) {
      unsubscribe = handleShowRoomMessages(pathId);
    }
  
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [pathRoom]);

  function handleSendRoomMessages() {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const userRoomDocRef = doc(usersRoomsRef, pathRoom);
    const userRoomSubcollection = collection(userRoomDocRef, `${chats[pathId].roomId}`);

    const regex = /^\s*$/;

    if (chats[pathId].members.some((user) => user.email === email) || chats[pathId].admin == uuid) {
      if (!regex.test(userMessage)) {
        addDoc(userRoomSubcollection, {
          message: userMessage.trim(),
          sentMessage: serverTimestamp(),
          userImage: getAuth().currentUser.photoURL,
          sentBy: getAuth().currentUser.displayName,
          sendermail: getAuth().currentUser.email,
          time: getTextDate(),
          roomId: chats[pathId].roomId,
        }).then(() => {
          setUserMessage("")
        }).catch((err) => {
          alert(err);
        })
    
        
        updateDoc(userRoomDocRef, {
          lastMessage: userMessage.trim(),
          lastMessageTime: getTextDate(),
        })
      .catch((err) => {
        alert(err);
      });
      } else {
        alert("Message must include characters")
      }
    } else {
      alert("Not a room member")
      router.push("/");
    }
//router.refresh()

  }

  useEffect(() => {
    setCurrentRoomId(pathId)
    //alert(currentRoomId)
  }, [pathId])

  useEffect(() => {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const parser = query(usersRoomsRef, orderBy("createdRoom"));
    const unsubscribe = onSnapshot(parser, snapshot => {
      const newChats = [];
      snapshot.forEach(doc => {
        newChats.push({
          roomName: doc.data().roomName,
          lastMessage: doc.data().lastMessage,
          lastMessageTime: doc.data().lastMessageTime,
          roomId: doc.id,
          members: doc.data().members,
          admin: doc.data().admin
        });
      });
      setChats([...newChats]);
      setFilteredChats([...newChats])
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function findCurrentIndex(e) {
      return chats.findIndex(item => item.roomId == currentPath)
  } 

  function handleNewAddedUsers() {
    let roomUsers = chats[pathId].members;
    for (let i = 0; i < addedRoomUsers.current.length; i++) {

      roomUsers.push({name: `${addedRoomUsers.current[i].usersName}`, email: `${addedRoomUsers.current[i].usersEmail}`, usersId: `${addedRoomUsers.current[i].usersUid}`})

    }
    return roomUsers;
  }

  function UpdateRoomUsers() {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const userRoomDocRef = doc(usersRoomsRef, pathRoom);

    if (removedUsers.length !== 0) {
    updateDoc(userRoomDocRef, {
      members: handleNewAddedUsers()
    }).then(() => {
      handleAddUsersModal()
    }).catch((err) => {
      alert(err);
    });
  } else {
    alert("Select a user to add");
  }
  }

  function handleAddUsersModal() {
    if (!addUsersModal) {
      showAddUsersModal(true)
      handleChatOptions()
      setOverlayFour(true)
    } else {
      showAddUsersModal(false);
      setOverlayFour(false)
      addedRoomUsers.current = [];
      setUsersList([...usersList, ...removedUsers]);
      setRemovedUsers([]);
    }
  }

  function handleRenameModal() {
    if (!renameShow) {
      setShowRename(true)
      setOverlayThree(true)
      handleChatOptions()
    } else {
      setShowRename(false)
      setOverlayThree(false);
      setNewName("")
    }
  }

  function renameRoom() {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const userRoomDocRef = doc(usersRoomsRef, pathRoom);

    const regex = /^\s*$/;

    if (!regex.test(newName) && newName.length >= 2) {
      updateDoc(userRoomDocRef, {
        roomName: newName.trim(),
      }).then(() => {
        handleRenameModal()
      }).finally(() => {
        setNewName("")
      })
    .catch((err) => {
      alert("Try again");
    }).finally(() => {
      setNewName("")
    });
    } else {
      alert("Room name must include a character, and can't be less than 2 characters");
    }
  }

  function removeUser() {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const userRoomDocRef = doc(usersRoomsRef, pathRoom);

    let updatedMembers = chats[pathId].members.filter((currUser) => currUser.email !== email);

    updateDoc(userRoomDocRef, {
      members: updatedMembers
    }).then(() => {
      handleChatOptions()
    }).finally(() => {
      router.push("/")
    }).catch((err) => {
      alert(err);
    });
  }

  function handleTheme() {
    if (!theme) {
      setTheme(true)
      if (typeof window !== "undefined") {
        localStorage.setItem("chattheme", "light")
      }
    } else {
      setTheme(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("chattheme", "dark")
      }
    }
  }

  useEffect(() => {
    if (typeof window != "undefined") {
      if (localStorage.getItem("chattheme") && localStorage.getItem("chattheme") == "dark") {
        setTheme(false);
      } else if (localStorage.getItem("chattheme") && localStorage.getItem("chattheme") == "light") {
        setTheme(true)
      } else {
        setTheme(false)
      }
    }  
  }, [])

  function handleHideDashboard() {
    if (!hideDashboard) {
      setHideDashboard(true)
      dashboard.current.classList.add("hide-dashboard")
     // mainBody.current.classList.add("max-width")
      dashboard.current.setAttribute("id", "")
      hide_Btn.current.classList.add("flip")
      if (typeof window !== "undefined") {
        localStorage.setItem("hidedashboard", "hidden")
      }
    } else {
      setHideDashboard(false)
      dashboard.current.setAttribute("id", "dashboard")
      dashboard.current.classList.remove("hide-dashboard")
      hide_Btn.current.classList.remove("flip")
      if (typeof window !== "undefined") {
        localStorage.setItem("hidedashboard", "shown")
      }
     // mainBody.current.setAttribute("id", "adad")
    }
  }

  useEffect(() => {
    if (typeof window != "undefined") {
      if (localStorage.getItem("hidedashboard") && localStorage.getItem("hidedashboard") == "hidden") {
        setHideDashboard(true)
      dashboard.current.classList.add("hide-dashboard")
     // mainBody.current.classList.add("max-width")
      dashboard.current.setAttribute("id", "")
      hide_Btn.current.classList.add("flip")
      if (typeof window !== "undefined") {
        localStorage.setItem("hidedashboard", "hidden")
      }
      } else if (localStorage.getItem("hidedashboard") && localStorage.getItem("hidedashboard") == "shown") {
        setHideDashboard(false)
        dashboard.current.setAttribute("id", "dashboard")
        dashboard.current.classList.remove("hide-dashboard")
        hide_Btn.current.classList.remove("flip")
        if (typeof window !== "undefined") {
          localStorage.setItem("hidedashboard", "shown")
        }
      } else {
        setHideDashboard(false)
      dashboard.current.classList.remove("hide-dashboard")
     // mainBody.current.classList.add("max-width")
      dashboard.current.setAttribute("id", "dashboard")
      hide_Btn.current.classList.remove("flip")
      if (typeof window !== "undefined") {
        localStorage.setItem("hidedashboard", "shown")
      }}
    }  
  }, [])

  function handleAllMembers() {
    if (!allMembers) {
      showAllMembers(true)
      showOverlayFive(true);
      handleChatOptions()
    } else {
      showAllMembers(false)
      showOverlayFive(false);
    }
  }

  function handleKickUserModal() {
    if (!kickModal) {
      showKickModal(true)
      showOverlaySix(true)
      handleChatOptions()
    } else {
      showKickModal(false)
      showOverlaySix(false)
    }
  }

  function kickRoomUser(mail) {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const userRoomDocRef = doc(usersRoomsRef, pathRoom);

    let updatedMembers = chats[pathId].members.filter((currUser) => currUser.email !== mail);

    updateDoc(userRoomDocRef, {
      members: updatedMembers
    }).catch((err) => {
      alert(err);
    });
  }

  const handleKeyDown = e => {
    if (e.keyCode === 13 && email != "") {
      handleSendRoomMessages()
    }
  };

  useEffect(() => {
    let ignore = false;
    if (typeof document !== "undefined" && !ignore) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      ignore = true;
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [userMessage])

    if (!return404) {
      return (
        <>
        <script src="/node_modules/material-design-lite/material.min.js" defer></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"></link>
    <title>{chats[pathId].roomName}</title>
        <main id='chat-body'>
          <section ref={dashboard} style={{backgroundColor: theme ? "white" : "#242424", borderRight: theme ? ".7px solid rgba(0, 0, 0, 0.1)" : ".7px solid rgba(255, 255, 255, 0.1)"}} id='dashboard'>
            <div className='dashboard-header-flex'>
              <div className='dashboard-header'>
              <img title={`${username}`} className='user-profile' src={`${profilePic}`}></img>
                <h1 style={{color: theme ? "#242424" : "white"}}>Chats</h1>
                <div className='dashboard-header-buttons'>
                  <button style={{color: theme ? "#242424" : "white"}} onClick={() => Authentication().signOutUser()} className='icon-btn'><i className='material-icons'>logout</i></button>
                  <div className='chat-add-opt'>
              <button style={{color: theme ? "#242424" : "white"}} ref={add_btn} onClick={() => handleChatPrivacyOptions()} className='icon-btn'><i className='material-icons'>add</i></button>
              {
        modal ?
        <>
        <div style={{backgroundColor: theme ? "white" : "#555", boxShadow: theme ? "0px 10px 10px #555" : ""}} className='chat-private-public'>
          <button style={{ color: theme ? "black" : "white"}} onClick={() => handlePublicModal()}>Public</button>
          {/*<button disabled={true}>Private</button>*/}
        </div>
        </>
        : <></>
      }
              </div>
                  <button style={{color: theme ? "#242424" : "white"}} onClick={() => handleTheme()} className='icon-btn'><i className='material-icons'>{ theme ? "mode_night" : "light_mode"}</i></button>
                </div>
              </div>
            </div>
            <div className='filter-input-flex'>
              <input style={{color: theme ? "#242424" : "white"}} onChange={e => setFilterText(e.target.value)} className='filter-input' type="text" placeholder='Search chats'></input>
            </div>
            <div className='chats-container'>
          {
            filteredChats.map((item, index) => (
              item.members.some((user) => user.email === email) || item.admin == uuid ? (
                <>
                
                  <div title={item.roomName} onMouseOver={() => setCurrentPath(item.roomId)} onTouchStart={() => setCurrentPath(item.roomId)}>
                    <Dashboard
                      key={index}
                      roomId={item.roomId}
                      getMessages={handleShowRoomMessages}
                      messageList={userMessagesList}
                      theme={theme}
                      currentIndex={findCurrentIndex()}
                      currentRoom={pathRoom}
                      roomName={item.roomName}
                      lastMessage={item.lastMessage}
                      lastMessageTime={item.lastMessageTime}
                      roomImage={`https://avatars.dicebear.com/api/initials/${item.roomName[0]}${item.roomName.includes(' ') ? item.roomName.split(' ')[1] : item.roomName[1]}m.svg`}
                    />
                  </div>
                  
                </>
              ) : (
                null
              )
            ))
          }
            </div>
          </section>
          <section ref={mainBody} style={{backgroundColor: theme ? "white" : "#242424", borderBottom: theme ? ".7px solid rgba(0, 0, 0, 0.1)" : ".7px solid rgba(255, 255, 255, 0.1)"}} id='chat-room-info'>
            <img className='room-profile-select'
            src={`https://avatars.dicebear.com/api/initials/${chats[pathId].roomName[0]}${chats[pathId].roomName.includes(' ') ? chats[pathId].roomName.split(' ')[1] : chats[pathId].roomName[1]}m.svg`}>
            </img>
            <div className='chat-room-name'>
              <h4 style={{color: theme ? "#242424" : "white"}}>{chats[pathId].roomName}</h4>
              <h4 style={{color: theme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"}}  className='lastmessage-text'><span className='message-time-sent'>Last message at </span>{chats[pathId].lastMessageTime}</h4>
            </div>
            <div className='more-horiz-room-btn-flex'>
              <button style={{color: theme ? "#242424" : "white"}} onClick={() => handleChatOptions()} className='icon-btn'><i className='material-icons'>more_horiz</i></button>
              {
                ChatOpt ?
                <>
                {
                  chats[pathId].admin == uuid 
                  ?
                  <div style={{backgroundColor: theme ? "white" : "#555", boxShadow: theme ? "0px 10px 10px #555" : ""}} className='chat-options'>
          <button style={{color: theme ? "black" : "white"}} onClick={() => handleAddUsersModal()}>Add User <i style={{fontSize: 20}} className='material-icons'>add</i></button>
          <button style={{color: theme ? "black" : "white"}} onClick={() => handleAllMembers()}>Members <i style={{fontSize: 17}} className='material-icons'>perm_identity</i></button>
          <button style={{color: theme ? "black" : "white"}} onClick={() => handleRenameModal()}>Rename <i style={{fontSize: 15}} className='material-icons'>edit</i></button>
          <button style={{color: theme ? "black" : "white"}} onClick={() => handleKickUserModal()}>Kick <i style={{fontSize: 17}} className='material-icons'>person_remove</i></button>
          <button style={{color: theme ? "black" : "white"}} onClick={() => deleteChatRoom()}>Delete <i style={{fontSize: 17}} className='material-icons'>delete</i></button>
          {/*<button disabled={true}>Private</button>*/}
        </div>
        : 
        <>
        <div style={{backgroundColor: theme ? "white" : "#555", boxShadow: theme ? "0px 10px 10px #555" : ""}} className='chat-options-non-admin'>
          <button style={{color: theme ? "black" : "white"}} onClick={() => handleAddUsersModal()}>Add User <i style={{fontSize: 20}} className='material-icons'>add</i></button>
          <button style={{color: theme ? "black" : "white"}} onClick={() => handleAllMembers()}>Members <i style={{fontSize: 17}} className='material-icons'>perm_identity</i></button>
          <button style={{color: theme ? "black" : "white"}} onClick={() => removeUser()}>Leave <i style={{fontSize: 17}} className='material-icons'>person_remove</i></button>
        </div>
        </>
                }
                
                </>
                : 
                <>
                </>
              }
            </div>
          </section>
          <section ref={mainBody} style={{backgroundColor: theme ? "white" : "#242424"}} id='body-message' class='main-content'>
          <div className='message-card-flex'>
          {
            userMessagesList.filter((sent) => sent.messageId == chats[pathId].roomId).map((item, index) => (
              <>
              
              <MessageCard time={getTextDate} messages={userMessagesList} id={item.id} pathId={pathId} pathRoom={pathRoom} 
                chats={chats} CurrentEmail={email} senderEmail={item.senderEmail}
                 theme={theme} image={item.messageImage} message={item.textMessage}
                  sender={item.sender} timesent={item.sentTime} />
              
              </>
            ))
          }
          </div>
          {
        publicModal ?
        <>
          <div className='create-public-flex'>
            <div style={{backgroundColor: theme ? "white" : "#555", boxShadow: theme ? "0px 10px 10px #555" : ""}} className='create-public'>
              <input style={{backgroundColor: theme ? "rgba(0, 0, 0, 0.3)" : "#242424", color: theme ? "black" : "white"}} maxLength="20" minLength="2" onChange={e => setUserRoomName(e.target.value)} className='chat-name-input' type="text" placeholder='Chat Name'></input>
              <div className='users-list-flex'>
              {
                usersList.filter((currUser) => currUser.usermail !== email).map((item, index) => (
                  <>
                  <div onClick={() => {
                    addedRoomUsers.current.push({
                      usersName: item.usersName,
                      usersUid: item.usersId,
                      usersEmail: item.usermail,
                    })
                    setRemovedUsers([...removedUsers, item]);
                    setUsersList(usersList.filter((currentItem) => currentItem.usermail !== item.usermail))
                  }} className='users-list'>
                    <img src={item.pfp} className='users-photo'></img>
                    <div>
                      <p style={{color: theme ? "black" : "white"}} className='users-list-name'>{item.usersName}</p>
                      <p style={{color: theme ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.7)"}} className='users-list-email'>{item.usermail}</p>
                      </div>
                  </div>
                  </>
                ))
              }
              </div>
              <div className='public-btns-flex'>
                <button onClick={() => handlePublicModal()} className='cancel-public-btn'>CANCEL</button>
                <button onClick={() => createNewRoom()} className='create-public-btn'>CREATE</button>
              </div>
            </div>
          </div>
        </>
        : <>

        </>
      }
      {
        renameShow ?
        <>
          <div className='rename-modal-flex'>
            <div style={{backgroundColor: theme ? "white" : "#555", boxShadow: theme ? "0px 10px 10px #555" : ""}} className='rename-modal'>
          <input style={{backgroundColor: theme ? "rgba(0, 0, 0, 0.3)" : "#242424", color: theme ? "black" : "white"}} maxLength="20" minLength="2" onChange={e => setNewName(e.target.value)} className='chat-name-input' type="text" placeholder='New Chat Name'></input>
          <div className='public-btns-flex'>
                <button onClick={() => handleRenameModal()} className='cancel-public-btn'>CANCEL</button>
                <button onClick={() => renameRoom()} className='create-public-btn'>RENAME</button>
              </div>
              </div>
          </div>
        </>
        : 
        <>

        </>
      }
      {
        addUsersModal ?
        <>
         <div className='add-person-modal-flex'>
            <div style={{backgroundColor: theme ? "white" : "#555", boxShadow: theme ? "0px 10px 10px #555" : ""}} className='add-person-modal'>
              <div className='add-person-flex'>
              {
                usersList
                .filter((currUser) => currUser.usermail !== email)
                .filter((currUser) => currUser.usersId !== chats[pathId].admin)
                .filter((currUser) => !chats[pathId].members.some(member => member.email === currUser.usermail))
                .map((item, index) => (
                  <>
                  <div onClick={() => {
                    addedRoomUsers.current.push({
                      usersName: item.usersName,
                      usersUid: item.usersId,
                      usersEmail: item.usermail,
                    })
                    setRemovedUsers([...removedUsers, item]);
                    setUsersList(usersList.filter((currentItem) => currentItem.usermail !== item.usermail))
                  }} className='users-list'>
                    <img src={item.pfp} className='users-photo' />
                    <div>
                      <p style={{color: theme ? "black" : "white"}} className='users-list-name'>{item.usersName}</p>
                      <p style={{color: theme ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.7)"}} className='users-list-email'>{item.usermail}</p>
                    </div>
                  </div>
                  </>
                ))
              }
              </div>
              <div className='public-btns-flex'>
                <button onClick={() => handleAddUsersModal()} className='cancel-public-btn'>CANCEL</button>
                <button onClick={() => UpdateRoomUsers()} className='create-public-btn'>ADD</button>
              </div>
            </div>
          </div>
        </>
        : 
        <>

        </>
      }
      {
        allMembers ?
        <>
          <div className='add-person-modal-flex'>
            <div style={{backgroundColor: theme ? "white" : "#555", boxShadow: theme ? "0px 10px 10px #555" : ""}} className='add-person-modal'>
              <div className='add-person-flex'>
              {
                usersList
                .filter((currUser) => chats[pathId].members.some(member => member.email === currUser.usermail) || currUser.usersId == chats[pathId].admin)
                .map((item, index) => (
                  <>
                  <div className='members-list'>
                    <img src={item.pfp} className='users-photo' />
                    <div>
                      <p style={{color: theme ? "black" : "white"}} className='users-list-name'>{email === item.usermail ? chats[pathId].admin === uuid ? "You (owner)" : "You" : chats[pathId].admin == item.usersId ? `${item.usersName} (owner)` : item.usersName}</p>
                      <p style={{color: theme ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.7)"}} className='users-list-email'>{item.usermail}</p>
                    </div>
                  </div>
                  </>
                ))
              }
              </div>
              <div className='public-btns-flex'>
                <button onClick={() => handleAllMembers()} className='cancel-public-btn'>CLOSE</button>
              </div>
            </div>
          </div>
        </>
        : <></>
      }
      {
                kickModal ?
                <>
                  <div className='add-person-modal-flex'>
            <div style={{backgroundColor: theme ? "white" : "#555", boxShadow: theme ? "0px 10px 10px #555" : ""}} className='add-person-modal'>
              <div className='add-person-flex'>
              {
                usersList
                .filter((currUser) => currUser.usermail !== email)
                .filter((currUser) => chats[pathId].members.some(member => member.email === currUser.usermail))
                .map((item, index) => (
                  <>
                  <div onClick={() => {
                    kickRoomUser(item.usermail)
                  }} className='users-list'>
                    <img src={item.pfp} className='users-photo' />
                    <div>
                      <p style={{color: theme ? "black" : "white"}} className='users-list-name'>{email === item.usermail ? chats[pathId].admin === uuid ? "You (owner)" : "You" : chats[pathId].admin == item.usersId ? `${item.usersName} (owner)` : item.usersName}</p>
                      <p style={{color: theme ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.7)"}} className='users-list-email'>{item.usermail}</p>
                    </div>
                  </div>
                  </>
                ))
              }
              </div>
              <div className='public-btns-flex'>
                <button onClick={() => handleKickUserModal()} className='cancel-public-btn'>CLOSE</button>
              </div>
            </div>
          </div>
                </>
                : <></>
              }
      </section>
          <footer style={{backgroundColor: theme ? "white" : "#242424", borderTop: theme ? ".7px solid rgba(0, 0, 0, 0.1)" : ".7px solid rgba(255, 255, 255, 0.1)"}} className='page-footer'>
              <div className='message-sender-container'>
              {/*<button onClick={() => handleEmojiPicker()} className='icon-btn'><i className='material-icons'>emoji_emotions</i></button>*/}
              <button style={{color: theme ? "#242424" : "white"}} ref={hide_Btn} onClick={() => handleHideDashboard()} className='icon-btn'><i className='material-icons'>chevron_left</i></button>
                <input style={{color: theme ? "black" : "white"}} maxLength="300" value={userMessage} onChange={e => setUserMessage(e.target.value)} className='message-input' type="text" placeholder='Aa'></input>
                <button style={{color: theme ? "#242424" : "white"}} onMouseOver={() => {
                  //setCurrentPath(chats.current[0].roomId)
                }} onClick={() => handleSendRoomMessages()} className='icon-btn'><i className='material-icons'>send</i></button>
              </div>
          </footer>
          {
            overlay ?
            <div onClick={() => handlePublicModal()} className='overlay'></div>
            : <></>
          }
          {
            overlayTwo ?
            <div onClick={() => handleChatOptions()} className='overlay'></div>
            : <></>
          }
          {
            overlayThree ?
            <div onClick={() => handleRenameModal()} className='overlay'></div>
            : <></>
          }
          {
            overlayFour ?
            <div onClick={() => handleAddUsersModal()} className='overlay'></div>
            : <></>
          }
          {
            overlayFive ?
            <div onClick={() => handleAllMembers()} className='overlay'></div>
            : <></>
          }
          {
            overlaySix ?
            <div onClick={() => handleKickUserModal()} className='overlay'></div>
            : <></>
          }
        </main>
        </>
    )
    } else {
      return (
        <>
         <h1>Chat room Id does not exist</h1>
        </>
      )
    }
}

export async function getServerSideProps({ params }) {
    let pathId = params.id;
    let pathRoom = params.roomid;
    const allChats = await handleAllUserChats();
    return {
        props: { pathId, pathRoom, allChats }
    }
}

const app = initializeApp(firebaseConfig);