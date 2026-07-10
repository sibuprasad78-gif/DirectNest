"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderEmail: string;
};
export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatid as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as Message[];

      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Please login first.");
      return;
    }

    if (!text.trim()) {
      return;
    }

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: auth.currentUser.uid,
      senderEmail: auth.currentUser.email || "DirectNest User",
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, "notifications", Date.now().toString()), {
  type: "message",
  chatId,
  title: "New Message",
  body: text,
  createdAt: serverTimestamp(),
  read: false,
});
    setText("");
  };
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          💬 DirectNest Chat
        </h1>

        <div className="h-[500px] overflow-y-auto border rounded-xl p-4 bg-gray-50">
          {loading ? (
            <p className="text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500">No messages yet. Start the chat.</p>
          ) : (
            messages.map((message) => {
              const isMine = message.senderId === auth.currentUser?.uid;

              return (
                <div
                  key={message.id}
                  className={`mb-4 flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-3 ${
                      isMine
                        ? "bg-blue-600 text-white"
                        : "bg-white text-black border"
                    }`}
                  >
                    <p className="text-sm font-semibold mb-1">
                      {isMine ? "You" : message.senderEmail}
                    </p>

                    <p>{message.text}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <form onSubmit={sendMessage} className="mt-5 flex gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border-2 border-gray-300 bg-white text-black placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}