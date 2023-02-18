/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
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
} from 'firebase/firestore';

import Link from 'next/link';
import Dashboard from '@/app/components/dashboard';
import { useRouter } from 'next/navigation'
import MessageCard from '@/app/components/messageCard';

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
const timer = useRef();
const [clean, setClean] = useState(false);
const [shouldRun, setShouldRun] = useState(true);

const [usersList, setUsersList] = useState([]);
const [removedUsers, setRemovedUsers] = useState([]);
const [currentRoomId, setCurrentRoomId] = useState()

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


    if (!regex.test(userRoomName)) {
      addDoc(usersRoomsRef, {
        roomName: userRoomName.trim(),
        admin: getAuth().currentUser.uid,
        members: handleAddedUsers(),
        lastMessage: "Chat Created",
        lastMessageTime: getTextDate(),
        createdRoom: serverTimestamp()
      })
      .then(docRef => {
        const userroomId = docRef.id;
        const userRoomDocRef = doc(usersRoomsRef, userroomId);
        const userRoomSubcollection = collection(userRoomDocRef, userRoomName);
        return addDoc(userRoomSubcollection, {});
      })
      .catch(error => {
        alert("Try Again");
      });
      handlePublicModal();
      setTimeout(() => {
        addedRoomUsers.current.splice(0, addedRoomUsers.current.length)
      }, 2000)
      setUsersList([...usersList, ...removedUsers]);
      setRemovedUsers([]);
      } else {
        alert("Room name must include a character.")
      }
  }

  async function deleteChatRoom() {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const userRoomDocRef = doc(usersRoomsRef, pathRoom);

    router.push("/")

   await deleteDoc(userRoomDocRef)
   /* .then(()=> {
    router.push("/")
   }) */

  }

  function handleShowRoomMessages(coll) {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const userRoomDocRef = doc(usersRoomsRef, pathRoom);
    const userRoomSubcollection = query(collection(userRoomDocRef, `${chats[pathId].roomName}`), orderBy("sentMessage"));
  
    setUserMessagesList([]);
  
    const unsubscribe = onSnapshot(userRoomSubcollection, snapshot => {
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
    const userRoomSubcollection = collection(userRoomDocRef, `${chats[pathId].roomName}`);

    const regex = /^\s*$/;

    if (!regex.test(userMessage)) {
      addDoc(userRoomSubcollection, {
        message: userMessage.trim(),
        sentMessage: serverTimestamp(),
        userImage: getAuth().currentUser.photoURL,
        sentBy: getAuth().currentUser.displayName,
        time: getTextDate(),
        roomId: chats[pathId].roomId,
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
    
    if (!return404) {
      return (
        <>
        <script src="/node_modules/material-design-lite/material.min.js" defer></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"></link>
    <title>{chats[pathId].roomName}</title>
        <main id='chat-body'>
          <section id='dashboard'>
            <div className='dashboard-header-flex'>
              <div className='dashboard-header'>
              <img title={`${username}`} className='user-profile' src={`${profilePic}`}></img>
                <h1>Chats</h1>
                <div className='dashboard-header-buttons'>
                  <button onClick={() => Authentication().signOutUser()} className='icon-btn'><i className='material-icons'>logout</i></button>
                  <div className='chat-add-opt'>
              <button ref={add_btn} onClick={() => handleChatPrivacyOptions()} className='icon-btn'><i className='material-icons'>add</i></button>
              {
        modal ?
        <>
        <div className='chat-private-public'>
          <button onClick={() => handlePublicModal()}>Public</button>
          {/*<button disabled={true}>Private</button>*/}
        </div>
        </>
        : <></>
      }
              </div>
                  <button className='icon-btn'><i className='material-icons'>light_mode</i></button>
                </div>
              </div>
            </div>
            <div className='filter-input-flex'>
              <input onChange={e => setFilterText(e.target.value)} className='filter-input' type="text" placeholder='Search chats'></input>
            </div>
            <div className='chats-container'>
          {
            filteredChats.map((item, index) => (
              item.members.some((user) => user.email === email) || item.admin == uuid ? (
                <>
                
                  <div title={item.roomName} onMouseOver={() => setCurrentPath(item.roomId)}>
                    <Dashboard
                      key={index}
                      roomId={item.roomId}
                      getMessages={handleShowRoomMessages}
                      messageList={userMessagesList}
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
          <section id='chat-room-info'>
            <img className='room-profile-select'
            src={`https://avatars.dicebear.com/api/initials/${chats[pathId].roomName[0]}${chats[pathId].roomName.includes(' ') ? chats[pathId].roomName.split(' ')[1] : chats[pathId].roomName[1]}m.svg`}>
            </img>
            <div className='chat-room-name'>
              <h4>{chats[pathId].roomName}</h4>
              <h4 className='lastmessage-text'><span className='message-time-sent'>Last message at </span>{chats[pathId].lastMessageTime}</h4>
            </div>
            <div className='more-horiz-room-btn-flex'>
              <button onClick={() => handleChatOptions()} className='icon-btn'><i className='material-icons'>more_horiz</i></button>
              {
                ChatOpt ?
                <>
                <div className='chat-options'>
          <button onClick={() => handlePublicModal()}>Add +</button>
          <button onClick={() => deleteChatRoom()}>Delete</button>
          {/*<button disabled={true}>Private</button>*/}
        </div>
                </>
                : 
                <>
                </>
              }
            </div>
          </section>
          <section id='body-message' class='main-content'>
          <div className='message-card-flex'>
          {
            userMessagesList.filter((sent) => sent.messageId == chats[pathId].roomId).map((item, index) => (
              <>
              
                <MessageCard image={item.messageImage} message={item.textMessage} sender={item.sender} timesent={item.sentTime} />
              
              </>
            ))
          }
          </div>
          {
        publicModal ?
        <>
          <div className='create-public-flex'>
            <div className='create-public'>
              <input onChange={e => setUserRoomName(e.target.value)} className='chat-name-input' type="text" placeholder='Chat Name'></input>
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
                      <p className='users-list-name'>{item.usersName}</p>
                      <p className='users-list-email'>{item.usermail}</p>
                      </div>
                  </div>
                  </>
                ))
              }
              </div>
              <div className='public-btns-flex'>
                <button onClick={() => handlePublicModal()} className='cancel-public-btn'>Cancel</button>
                <button onClick={() => createNewRoom()} className='create-public-btn'>Create</button>
              </div>
            </div>
          </div>
        </>
        : <>

        </>
      }
      </section>
          <footer className='page-footer'>
              <div className='message-sender-container'>
              <button className='icon-btn'><i className='material-icons'>emoji_emotions</i></button>
                <input onChange={e => setUserMessage(e.target.value)} className='message-input' type="text" placeholder='Aa'></input>
                <button onMouseOver={() => {
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

//setShouldRun(false);
            /*userMessagesList.current.push({
              sender: change.doc.data().sentBy,
                textMessage: change.doc.data().message,
                messageImage: change.doc.data().userImage,
                sentTime: change.doc.data().time,
            })*/
            //setUserMessagesList([...userMessagesList])


  /*function handleAllUserChats() {
    
    const firestore = getFirestore();
const documentRef = doc(firestore, `rooms/AllRooms`);
const usersRoomsRef = collection(documentRef, `userRooms`);
const parser = query(usersRoomsRef, orderBy("createdRoom"))
 myRef = onSnapshot(parser, snapshot => {
  snapshot.docChanges().forEach((change) => {
    if (change.type == "added") {
      chats.push({
        roomName: change.doc.data().roomName,
        lastMessage: change.doc.data().lastMessage,
        lastMessageTime: change.doc.data().lastMessageTime,
        roomId: change.doc.id,
        members: change.doc.data().members,
        admin: change.doc.data().admin,
      })
      setChats([...chats])
      setFilteredChats([...chats])
    } if (change.type == "modified") {
      //chats.current[pathId].lastMessage = change.doc.data().lastMessage
      //chats.current[pathId].lastMessageTime = change.doc.data().lastMessageTime;
      //setFilteredChats([...chats.current])
      
    }
  })
})

timer.current = setTimeout(() => {
  cleanChatsArray()
}, 3000)

  }

  useEffect(() => {
    let ignore = false;

    if (!ignore && email != "") {
      handleAllUserChats();
      }
      return () => {
        ignore = true;
      }
  }, [])*/

  /*function handleAllUserChats() {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const parser = query(usersRoomsRef, orderBy("createdRoom"));
  
    useEffect(() => {
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
        alert("Got Data Rwq")
      });
  
      return () => {
        unsubscribe();
      };
    }, [parser]);
  
    return chats;
  }*/

  /*item.members.some((user) => user.email === email) || item.admin == uuid ? (
                <>
                <Link scroll={false} href="/[id]/[roomid]" as={`/${findCurrentIndex()}/${item.roomId}`}>
                  <div onMouseOver={() => setCurrentPath(item.roomId)}>
                    <Dashboard
                      key={index}
                      roomId={""}
                      currentRoom={"homepage"}
                      roomName={item.roomName}
                      lastMessage={item.lastMessage}
                      lastMessageTime={item.lastMessageTime}
                      roomImage={`https://avatars.dicebear.com/api/initials/${item.roomName[0]}${item.roomName.includes(' ') ? item.roomName.split(' ')[1] : item.roomName[1]}m.svg`}
                    />
                  </div>
                </Link>
                </>
              ) : (
                <></>
              )*/

              /*function cleanChatsArray() {
    for (let i = 0; i < chats.length; i++) {
        if (chats[i].admin == `${uuid}` || chats[i].members.some((user) => user.email === email)) {
          chats.pop();
          //setChats([...chats])
         // chats.current = chats.current;
          setFilteredChats([...chats])
        } else {
          return;
        }
    }
}*/

  /*useEffect(() => {
    handleAllUserChats()
  }, [])*/


  /*useEffect(() => {
    const firestore = getFirestore();
const documentRef = doc(firestore, `rooms/AllRooms`);
const usersRoomsRef = collection(documentRef, `userRooms`);
const parser = query(usersRoomsRef, orderBy("createdRoom"))
 const unsubscribe = onSnapshot(parser, snapshot => {
  snapshot.docChanges().forEach((change) => {
    if (change.type == "added") {
      chats.current.push({
        roomName: change.doc.data().roomName,
        lastMessage: change.doc.data().lastMessage,
        lastMessageTime: change.doc.data().lastMessageTime,
        roomId: change.doc.id,
        members: change.doc.data().members,
        admin: change.doc.data().admin,
      })
      //setChats([...chats])
      
      setFilteredChats([...chats.current])
      for (let i = 0; i < chats.current.length; i++) {
        if (chats.current[i].admin == `${uuid}` || chats.current[i].members.some((user) => user.email === email)) {
          chats.current.pop();
          //setChats([...chats])
         // setFilteredChats([...chats.current])
        }
      }
    } if (change.type == "modified") {
      //chats.current[pathId].lastMessage = change.doc.data().lastMessage
      //chats.current[pathId].lastMessageTime = change.doc.data().lastMessageTime;
      //setFilteredChats([...chats.current])
      
    }
  })
})

    return () => {
      unsubscribe()
    }
  }, [])*/

  /*function handlelocalstorage() {
    
    if (typeof window !== 'undefined') {
      const image = localStorage.getItem("profilePic")
      return image;
    } else {
      return profilePic;
    }
  }*/

  /* useEffect(() => {
    if (shouldRun) {
      setShouldRun(false)
    } else {
      setShouldRun(true)
    }
  }, [shouldRun]) */

  /*useEffect(() => {
    
  
   handleShowRoomMessages(pathId);
  
    
  }, [pathId]);*/