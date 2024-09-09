"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function Rooms() {
  const [rooms, setRooms] = useState([]); // State to store available chat rooms
  const [roomName, setRoomName] = useState(""); // State to manage the input for creating a new room
  const [selectedRoom, setSelectedRoom] = useState(null); // State to store the currently selected room
  const [messages, setMessages] = useState([]); // State to store chat messages
  const [onlineMembers, setOnlineMembers] = useState([]); // State to store online members in the current room
  const [newMessage, setNewMessage] = useState(""); // State to manage the input for a new message
  const [typingStatus, settypingStatus] = useState({}); // State to manage typing status of users
  const router = useRouter(); // Hook for navigation
  const [socket, setSocket] = useState(null); // State to store the socket instance
  const chatEndRef = useRef(null); // Ref to scroll to the bottom of the chat

  useEffect(() => {
    const token = JSON.parse(sessionStorage.getItem("userdata"))?.token;

    // Initialize socket connection
    const socketInstance = io("http://localhost:8000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    setSocket(socketInstance);

    // Listen for available rooms and update state
    socketInstance.on("availableRooms", (availableRooms) => {
      setRooms(availableRooms);
    });

    // Listen for chat history when joining a room
    socketInstance.on("chatHistory", (chats) => {
      setMessages(chats);
      socketInstance.on("onlineUser", (status) => {
        setOnlineMembers(status);
      });
      scrollToBottom(); // Scroll to the bottom of the chat when new history is loaded
    });

    // Listen for new messages and update state
    socketInstance.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      var audio = new Audio("/audios/livechat-129007.mp3");
      audio.play(); // Play a sound when a new message is received
      scrollToBottom(); // Scroll to the bottom of the chat
    });

    // Listen for typing and stop typing events
    socketInstance.on("userTyping", (username) => {
      settypingStatus((prev) => ({ ...prev, [username]: true }));
    });
    socketInstance.on("userStoppedTyping", (username) => {
      settypingStatus((prev) => ({
        ...prev,
        [username]: false,
      }));
    });

    // Clean up on component unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Function to scroll chat to the bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Function to create a new chat room
  const createRoom = () => {
    if (!roomName.trim()) {
      alert("Room name cannot be empty.");
      return;
    }

    if (socket) {
      socket.emit("createRoom", roomName);
      setRoomName("");
    }
  };

  // Function to join a chat room
  const joinRoom = (roomName) => {
    if (socket) {
      setSelectedRoom(roomName);
      socket.emit("joinRoom", roomName);
    }
  };

  // Function to send a message to the selected room
  const sendMessage = () => {
    if (newMessage.trim() && socket && selectedRoom) {
      socket.emit("sendMessage", {
        roomName: selectedRoom,
        message: newMessage,
      });
      socket.emit("stopTyping", selectedRoom);
      var audio = new Audio("/audios/mixkit-message-pop-alert-2354.mp3");
      audio.play(); // Play a sound when a message is sent
      setNewMessage("");
    }
  };

  // Function to handle user logout
  const handleLogOut = () => {
    sessionStorage.removeItem("userdata");
    sessionStorage.removeItem("username");
    router.push("/");
  };

  // Function to handle typing events
  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    if (value.length > 0) {
      socket.emit("typing", selectedRoom);
    } else {
      socket.emit("stopTyping", selectedRoom);
    }
  };

  return (
    <div className="bg-black min-h-screen flex text-white">
      {/* Left Sidebar - Rooms and Members */}
      <div className="w-1/3 bg-black p-4 border-r border-gray-700 h-[100vh]">
        <h1 className="text-2xl font-bold mb-4">Rooms</h1>
        <div className="mb-4 flex ">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room name"
            className="p-2 w-[80%] border border-gray-700 rounded-lg bg-gray-800 text-white"
          />
          <button
            onClick={createRoom}
            className=" bg-white text-white rounded-lg p-2 ms-2 hover:bg-gray-300 transition"
          >
            <Image
              src="/images/add.png"
              width={30}
              height={100}
              alt="create Room"
            ></Image>
          </button>
        </div>
        <ul className="space-y-2">
          {rooms.map((room, index) => (
            <li
              key={index}
              onClick={() => joinRoom(room.name)}
              className={`p-3 bg-gray-800 rounded-lg cursor-pointer flex items-center gap-3 hover:bg-gray-700 transition ${
                selectedRoom === room.name ? "bg-blue-500" : ""
              }`}
            >
              <Image
                src="/images/partners.png"
                width={20}
                height={100}
                alt="group"
              ></Image>
              {room.name} ({room.members} members)
            </li>
          ))}
        </ul>

        {selectedRoom ? (
          <div className="mt-6">
            <h2 className="flex  flex-col justify-center  items-center">
              <Image
                src="/images/group.png"
                width={50}
                height={100}
                alt="members"
              ></Image>
            </h2>
            <hr className="mb-2"></hr>

            <ul className="space-y-2">
              {onlineMembers?.map((member, index) => (
                <li
                  key={index}
                  className="text-white bg-gray-800 p-2 rounded-lg flex items-center space-x-2"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      member.online ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <span>
                    {member.username}{" "}
                    <span className="text-sm text-green-500">
                      {typingStatus[member.username] ? "Typing..." : ""}
                    </span>{" "}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          ""
        )}
      </div>

      {/* Right Side - Chat */}
      <div className="w-2/3 bg-black p-4 flex flex-col h-[100vh]">
        {selectedRoom ? (
          <>
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold mb-4 flex">
                {selectedRoom} - Chat
              </h2>
              <h2 className="text-2xl font-bold mb-4 flex gap-2">
                {JSON.parse(sessionStorage.getItem("username"))}
                <button
                  className="w-10 h-10 rounded-lg bg-white flex justify-center items-center"
                  onClick={handleLogOut}
                >
                  <div>
                    <Image
                      src="/images/user-logout.png"
                      width={25}
                      height={100}
                      alt="logout"
                    ></Image>
                  </div>
                </button>
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2 scrollbar-custom">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.user === JSON.parse(sessionStorage.getItem("username"))
                      ? "justify-end"
                      : "justify-start"
                  } ${
                    msg.user === "system"
                      ? "justify-center text-sm bg-transparent"
                      : "mkc"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-xs ${
                      msg.user ===
                      JSON.parse(sessionStorage.getItem("username"))
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-white"
                    } ${
                      msg.user === "system" ? " text-sm bg-transparent" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      {msg.user == "system" ? "" : msg.user}
                    </p>
                    <p>{msg.message}</p>
                    <p className="text-xs opacity-50">
                      {msg.user == "system"
                        ? ""
                        : new Date(msg.time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} style={{ marginBottom: "100px" }}></div>
            </div>

            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => handleTyping(e)}
                placeholder="Type your message..."
                className="p-3 w-full border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={sendMessage}
                className="ml-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition duration-300"
              >
                <Image
                  src="/images/send-mail.png"
                  width={30}
                  height={100}
                  alt="send"
                ></Image>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <h2 className="text-xl">Select a room to start chatting</h2>
          </div>
        )}
      </div>
    </div>
  );
}
