"use client";

import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import { Aladin, Inter, Questrial, Romanesco } from '@next/font/google'
import styles from './page.module.css';
import  Link  from "next/link";
import { useRouter } from 'next/navigation';
import "src/app/globals.css"
//import { initializeApp } from "firebase/app";
import { firebaseConfig } from 'firebaseconfig';
import { initializeApp } from "firebase/app";

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
  where,} from 'firebase/firestore';
import Dashboard from './components/dashboard';
import SignInPage from './components/signin';

export default function Home() {
  const [filtered, setFiltered] = useState([]);
  
 /* const chats = useRef([
    {roomName: "Kitchen Chat", lastMessage: "What's for dinner tonight?", lastMessageTime: "11/02 17:30", roomId: "AbCdEfG1HjKlMnOpQrS"},
  {roomName: "Game Night", lastMessage: "Who's bringing the snacks?", lastMessageTime: "10/02 19:45", roomId: "TuvWxYZaBcDeFgHiJkLm"},
  {roomName: "Book Club", lastMessage: "Next book is 'To Kill a Mockingbird'", lastMessageTime: "08/02 20:15", roomId: "NoPqRsTuVwXyZaBcDeFg"},
  {roomName: "Work Project", lastMessage: "Deadline extended to next week", lastMessageTime: "07/02 15:30", roomId: "HiJkLmNoPqRsTuVwXyZa"},
  {roomName: "Music Lovers", lastMessage: "Latest album by Billie Eilish is a hit!", lastMessageTime: "06/02 14:45", roomId: "BcDeFgHiJkLmNoPqRsTu"},
  {roomName: "Travel Plans", lastMessage: "Who's up for a road trip?", lastMessageTime: "05/02 18:15", roomId: "VwXyZaBcDeFgHiJkLmNo"},
  {roomName: "Movie Night", lastMessage: "What movie should we watch tonight?", lastMessageTime: "04/02 21:30", roomId: "PqRsTuVwXyZaBcDeFgHi"},
  {roomName: "Fitness Group", lastMessage: "Who's joining the morning workout?", lastMessageTime: "03/02 06:45", roomId: "JkLmNoPqRsTuVwXyZaBc"},
  {roomName: "Foodie Friends", lastMessage: "Best sushi place in town?", lastMessageTime: "02/02 20:15", roomId: "DeFgHiJkLmNoPqRsTuVw"},
  {roomName: "Tech Talk", lastMessage: "What's the latest smartphone on the market?", lastMessageTime: "01/02 18:30", roomId: "XyZaBcDeFgHiJkLmNoPq"},
  {roomName: "myChat", lastMessage: "What's the latest smartphone on the market?", lastMessageTime: "01/02 18:30", roomId: "Ylqa1cDZ5gHiOkLmNLP2"}
  ]);*/

  const [chats, setChats] = useState([
    //{roomName: "Kitchen Chat", lastMessage: "What's for dinner tonight?", lastMessageTime: "11/02 17:30", roomId: "AbCdEfG1HjKlMnOpQrS", members: [{email: "dokugo90@gmail.com"}, {email: "dokugo80@gmail.com"}], admin: "bvs2MOga5NhIrwXvjNcHGFlcRCp2"},
  ])

  /*const usersList = useRef([

  ])*/

  const [usersList, setUsersList] = useState([]);
  const [removedUsers, setRemovedUsers] = useState([]);

  const addedRoomUsers = useRef([

  ])

  const [filterText, setFilterText] = useState("");
  const [filteredChats, setFilteredChats] = useState(chats);
  const [profilePic, setProfilePic] = useState("");
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("");
  const [uuid, setuuid] = useState("");
  const [signedIn, IsSignedIn] = useState(false);
  const [saveUserData, shouldSaveUserData] = useState(false);
  const [modal, showModal] = useState(false);
  const [publicModal, showPublicModal] = useState(false);
  const [overlay, showOverlay] = useState(false);
  const [userRoomName, setUserRoomName] = useState("");
  const [fetchedData, setFetched] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [clearAddedUsers, setClearAddedUsers] = useState(false);
  const [theme, setTheme] = useState(false);
  const add_btn = useRef();
  const unsubscribeRef = useRef();
  const users_div = useRef();

  const router = useRouter();

  const app = initializeApp(firebaseConfig);

  useEffect(() => {
    
    setFilteredChats(chats.filter(item => item.roomName.toLowerCase().includes(filterText.toLowerCase())));
    
  }, [filterText])

  function Authentication() {
    return {
      signIn: async function() {
        let provider = new GoogleAuthProvider();
        const user = await signInWithPopup(getAuth(), provider)
        if (user) addUserToDatabase();
        
      },
      authState: async function() {
          onAuthStateChanged(getAuth(), (user) => {
            if (getAuth().currentUser != null) {
              if (typeof window !== 'undefined') {
                localStorage.setItem("loggedInChatUp", true);
                IsSignedIn(localStorage.getItem("loggedInChatUp"))
                localStorage.setItem("profilePic", getAuth().currentUser.photoURL);
              }
                  setProfilePic(getAuth().currentUser.photoURL)
                  setUsername(getAuth().currentUser.displayName)
                  setEmail(getAuth().currentUser.email);
                  setuuid(getAuth().currentUser.uid);
                  IsSignedIn(true)
            } else {
              if (typeof window !== "undefined") {
                localStorage.setItem("loggedInChatUp", false);
                IsSignedIn(localStorage.getItem("loggedInChatUp"));
              }
                setProfilePic("")
                setUsername("")
                IsSignedIn(false)
            }
          })
      },
      signOutUser: async function() {
        signOut(getAuth());
        router.refresh();
      }
    }
  }

  function handleChatPrivacyOptions() {
    if (!modal) {
      showModal(true)
      add_btn.current.classList.add("rotate")
    } else {
      showModal(false)
      add_btn.current.classList.remove("rotate")
    }
  }

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
          setUsersList([...usersList])
          
        }
      })
    })
  }

  useEffect(() => {
    handleUsersList();
    return () => {
      unsubscribeRef.current();
    };
  }, []);

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

  function handleAddedUsers() {
    let roomUsers= [];
    //addedRoomUsers.current[i].roomName
    //[{name: addedRoomUsers.current[i].usersName, email: addedRoomUsers.current[i].usersEmail, usersId: addedRoomUsers.current[i].usersUid}]
    for (let i = 0; i < addedRoomUsers.current.length; i++) {

      roomUsers.push({name: `${addedRoomUsers.current[i].usersName}`, email: `${addedRoomUsers.current[i].usersEmail}`, usersId: `${addedRoomUsers.current[i].usersUid}`})

    }
    return roomUsers;
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

  function createNewRoom() {
    const firestore = getFirestore();
const documentRef = doc(firestore, `rooms/AllRooms`);
//const createdRoomsCollection = collection(documentRef, `${userRoomName}`)
const usersRoomsRef = collection(documentRef, `userRooms`);
//const individualRefs = collection(usersRoomsRef, `${userRoomName}`)
const regex = /^\s*$/;

if (!regex.test(userRoomName) && userRoomName.length >= 2) {
addDoc(usersRoomsRef, {
  roomName: userRoomName.trim(),
  admin: getAuth().currentUser.uid,
  members: handleAddedUsers(),
  lastMessage: "Chat Created",
  lastMessageTime: getTextDate(),
  createdRoom: serverTimestamp()
})
.then(() => {
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
/*.then(docRef => {
  const userroomId = docRef.id;
  const userRoomDocRef = doc(usersRoomsRef, userroomId);
  const userRoomSubcollection = collection(userRoomDocRef, userRoomName);
  return addDoc(userRoomSubcollection, {});
})*/
/*.catch(error => {
  alert("Try Again");
});
handlePublicModal();
setTimeout(() => {
  addedRoomUsers.current.splice(0, addedRoomUsers.current.length)
}, 2000)
setUsersList([...usersList, ...removedUsers]);
setRemovedUsers([]);*/
} else {
  alert("Room name must include a character, and can't be less than 2 characters")
}

/*addDoc(individualRefs, {})
.catch(error => {
  alert("Try Again");
});*/

/*addDoc(subCollectionRef, {
  admin: getAuth().currentUser.uid,
  members: handleAddedUsers()
})
.catch(error => {
  alert("Try Again");
});*/

/*const collectionRef = collection(firestore, `rooms`)
const doccu = doc(firestore, `rooms/${getAuth().currentUser.email}`)

setDoc(doccu, {
  roomName: userRoomnName,
  admin: getAuth().currentUser.uid,
  members: handleAddedUsers(),
  lastMessage: "Chat Created",
  lastMessageTime: getTextDate(),
}).catch((err) => {
  alert("Try Again")
})*/
  }

 /* function handleAllUserChats() {
    const firestore = getFirestore();
const documentRef = doc(firestore, `rooms/AllRooms`);
const usersRoomsRef = collection(documentRef, `userRooms`);
const parser = query(usersRoomsRef, orderBy("createdRoom"))
onSnapshot(parser, snapshot => {
  snapshot.forEach((change) => {
   
      chats.push({
        roomName: change.data().roomName,
        lastMessage: change.data().lastMessage,
        lastMessageTime: change.data().lastMessageTime,
        roomId: change.id,
        members: change.data().members,
        admin: change.data().admin,
      })
      setChats([...chats])
      setFilteredChats([...chats])
    
  })
})
  }

  useEffect(() => {
    let ignore = false;

    if (!ignore && email != "") {
      handleAllUserChats()
    }
    return () => {
      ignore = true
    }
  }, [email])*/

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

  function addUserToDatabase() {
    onSnapshot(query(collection(getFirestore(), 'users'), where("uniqueId", "==", getAuth().currentUser.uid)), snapshot => {
      if (snapshot.empty) {
        addDoc(collection(getFirestore(), 'users'),  {
          username: getAuth().currentUser.displayName,
          photo: getAuth().currentUser.photoURL,
          email: getAuth().currentUser.email,
          uniqueId: getAuth().currentUser.uid,
          createdAccount: serverTimestamp()
        })
      } else {
        return;
      }
    })
    //window.location.reload()
  }

  useEffect(() => {
    let ignore = false;

    if (!ignore) {

    }

    return () => {
      ignore = true;
    }
  }, [])

  useEffect(() => {
    let ignore = false;
    if (!ignore) {
        Authentication().authState()
    }
    return () => {
        ignore = true;
    }
  }, [])

  function findCurrentIndex(e) {
    return chats.findIndex(item => item.roomId == currentPath)
} 

const LoadingIndicator = () => (
  <div>Loading...</div>
);

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

  if (signedIn) {
    return (
      <>
      <script src="/node_modules/material-design-lite/material.min.js" defer></script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"></link>
  <title>ChatUp v2</title>
      <main style={{backgroundColor: theme ? "white" : "#242424", borderRight: theme ? ".7px solid rgba(0, 0, 0, 0.1)" : ".7px solid rgba(255, 255, 255, 0.1)"}} id='chat-body'>
        <section style={{backgroundColor: theme ? "white" : "#242424", borderRight: theme ? ".7px solid rgba(0, 0, 0, 0.1)" : ".7px solid rgba(255, 255, 255, 0.1)"}} id='dashboard'>
          <div className='dashboard-header-flex'>
            <div className='dashboard-header'>
              <img title={`${username}`} className='user-profile' src={`${profilePic}`}></img>
              <h1 style={{color: theme ? "#242424" : "white"}} className='chats-header-text'>Chats</h1>
              <div className='dashboard-header-buttons'>
                <button style={{color: theme ? "#242424" : "white"}} onClick={() => Authentication().signOutUser()} className='icon-btn'><i className='material-icons'>logout</i></button>
                <div className='chat-add-opt'>
                <button style={{color: theme ? "#242424" : "white"}} onClick={() => handleChatPrivacyOptions()} className='icon-btn'><i ref={add_btn} className='material-icons'>add</i></button>
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
                <button style={{color: theme ? "#242424" : "white"}} onClick={() => handleTheme()} className='icon-btn'><i className='material-icons'>{ theme ? "mode_night" : "light_mode"}</i></button>
              </div>
            </div>
          </div>
          <div className='filter-input-flex'>
            <input style={{color: theme ? "#242424" : "white"}} onChange={e => setFilterText(e.target.value)} className='filter-input' type="text" placeholder='Search chats'></input>
          </div>
          <div className='chats-container'>
            {/* {
              filteredChats.map((item, index) => (
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
              ))
            } */}
            {
              filteredChats.map((item, index) => (
                item.members.some((user) => user.email === email) || item.admin == uuid ? (
                  <>
                  
                    <div title={item.roomName} onMouseOver={() => setCurrentPath(item.roomId)}>
                      <Dashboard
                        key={index}
                        roomId={item.roomId}
                        currentIndex={findCurrentIndex()}
                        currentRoom={"homepage"}
                        theme={theme}
                        roomName={item.roomName}
                        lastMessage={item.lastMessage}
                        lastMessageTime={item.lastMessageTime}
                        roomImage={`https://avatars.dicebear.com/api/initials/${item.roomName[0]}${item.roomName.includes(' ') ? item.roomName.split(' ')[1] : item.roomName[1]}m.svg`}
                      />
                    </div>
                  
                  </>
                ) : (
                  <></>
                )
              ))
            }
          </div>
        </section>
        {
          publicModal ?
          <>
            <div className='create-public-flex'>
              <div className='create-public'>
                <input maxLength="20" minLength="2" onChange={e => setUserRoomName(e.target.value)} className='chat-name-input' type="text" placeholder='Chat Name'></input>
                <div className='users-list-flex'>
                {
                  usersList.filter((currUser) => currUser.usermail !== email).map((item, index) => (
                    <>
                    <div ref={users_div} onClick={() => {
                      addedRoomUsers.current.push({
                        usersName: item.usersName,
                        usersUid: item.usersId,
                        usersEmail: item.usermail,
                      })
                      //let filteredList = 
                      //usersList.filter((Item) => Item.usersEmail !== "Itz. dukz")
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
                  <button onClick={() => handlePublicModal()}  className='cancel-public-btn'>Cancel</button>
                  <button onClick={() => createNewRoom()} className='create-public-btn'>Create</button>
                </div>
              </div>
            </div>
          </>
          : <>

          </>
        }
        {
              overlay ?
              <div onClick={() => handlePublicModal()} className='overlay'></div>
              : <></>
            }
      </main>
      </>
    )
  } else {
    return (
      <>
      <script src="/node_modules/material-design-lite/material.min.js" defer></script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"></link>
  <div className='signin-flex'>
            <div id='signin-div'>
                <h1 style={{textAlign: "center"}}>ChatUp</h1>
                <div className='icons-div'><i style={{fontSize: 50}} className='material-icons'>chat</i></div>
                <button onClick={() => Authentication().signIn()} className='signin-btn'>SIGN IN WITH GOOGLE</button>
            </div>  
        </div>
      </>
    )
  }
}
