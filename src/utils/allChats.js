import { getFirestore, collection, doc, query, onSnapshot, orderBy } from 'firebase/firestore';


export async function handleAllUserChats() {
    const firestore = getFirestore();
    const documentRef = doc(firestore, `rooms/AllRooms`);
    const usersRoomsRef = collection(documentRef, `userRooms`);
    const parser = query(usersRoomsRef, orderBy("createdRoom"));
    
    let chats = [];
    const snapshot = await new Promise((resolve) => {
      const unsubscribe = onSnapshot(parser, (snapshot) => {
        resolve(snapshot);
        unsubscribe();
      });
    });
    
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        chats.push({
          roomName: change.doc.data().roomName,
          lastMessage: change.doc.data().lastMessage,
          lastMessageTime: change.doc.data().lastMessageTime,
          roomId: change.doc.id,
          members: change.doc.data().members,
          admin: change.doc.data().admin
        });
      }
    });
    
    return chats;
  }