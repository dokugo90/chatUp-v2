import React, { useState, useRef, useEffect } from 'react';
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



export default function SignInPage() {

    function Authentication() {
        return {
          signIn: async function() {
            let provider = new GoogleAuthProvider();
            await signInWithPopup(getAuth(), provider)
          },
          authState: async function() {
              onAuthStateChanged(getAuth(), (user) => {
                if (getAuth().currentUser != null) {
                      localStorage.setItem("loggedInChatUp", true)
                     
                } else {
                    localStorage.setItem("loggedInChatUp", false);
                }
              })
          },
        }
      }

      useEffect(() => {
        let ignore = false;
        if (!ignore) {
            Authentication().authState()
        }
        return () => {
            ignore = true;
        }
      }, [])

    return (
        <>
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

const app = initializeApp(firebaseConfig);