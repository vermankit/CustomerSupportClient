import React, { useEffect, useState,useRef } from 'react';
import * as signalR from "@microsoft/signalr";

function AgentChatWindow(props) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null); 
  const [connected,setConnected] = useState(false);
  const [connectionId,setConnectionId] = useState(""); 
  const [usersList,setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(""); 
  const [userMessages, setUserMessages] = useState({});
  const selectedUserIdRef = useRef("");



  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/chathub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();
    setConnection(newConnection);
    setConnected(true);
    newConnection.on("ReceiveMessageWithUserId", (userId,message) => {
      // Handle the received message
      if(userId === selectedUserIdRef.current){
        setMessages((prevMessages) => [...prevMessages, message]);
      }      
      setUserMessages((prevUserMessages) => ({
        ...prevUserMessages,
        [userId]: [...(prevUserMessages[userId] || []), message],
      }));
    });


    newConnection.start()
      .then(() => {        
        newConnection.invoke('UpdateAgentConnectionId', props.userId) 
        .then((response) => {
          console.log("Response from server:", response);
          if (response !== null) {              
          }
        })
        .catch((error) => {
          console.error('Error retrieving connection ID:', error);
        });        
      })
      .catch((error) => console.error(error));      

    return () => {     
      
    };
  }, []);
   
  useEffect(() => {       
    const fetchUserList = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/Session/all?agentid=${props.userId}`);
        if (response.ok) {
          const userList = await response.json();   
          console.log(userList);       
          setUserList(userList);
        } else {
          console.error('Failed to fetch user list.');
        }
      } catch (error) {
        console.error('Error fetching user list:', error);
      }
    };    

    if (connected) {
      fetchUserList();
    }       
    const intervalId = setInterval(fetchUserList, 5000);  
    return () => {
      clearInterval(intervalId);
    };
  }, [connected]);


  const sendMessage = () => {
    if (connection && message) {   
      connection.invoke("SendMessageToUser",selectedUserId, message)
        .catch((error) => console.error(error));    
    }
  }

  const handleUserSelect = (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    setMessages(userMessages[userId] || []);
    selectedUserIdRef.current  = userId;
  };
  const getConnectionId = () => {
    if (connection) {  
      connection.invoke("GetConnectionId")
      .then((response => {
        setConnectionId(response);
      }))
        .catch((error) => console.error(error));     
    }
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Agent Window</h3>
          <select
              className="form-control"
              value={selectedUserId}
              onChange={handleUserSelect}
            >
              <option value="">Select customer name for reply</option>
              {usersList.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          <h3 className="card-title">{connectionId}</h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label>Welcome: {props.name}</label>
            
            <input
              type="text"
              className="form-control"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          <button className="btn btn-primary mt-2" onClick={sendMessage}>Send</button>     
          {/* <button className="btn btn-primary mt-2" onClick={getConnectionId}>ConnectionId</button>         */}
          </div>
        </div>
        <ul className="list-group mt-3">
          {messages.map((message, index) => (
            <li key={index} className="list-group-item">{message}</li>
          ))}
        </ul>
        <div>      
      </div>
      </div>
    </div>
  );
}
export default AgentChatWindow;
