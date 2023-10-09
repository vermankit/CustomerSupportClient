import React, { useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";

function AgentChatWindow(props) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null); 
  const [connected,setConnected] = useState(false);
  const [connectionId,setConnectionId] = useState(""); 
  const [usersList,setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(""); 

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7137/chathub", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();
    setConnection(newConnection);
    setConnected(true);
    newConnection.on("ReceiveMessage", (message) => {
      // Handle the received message
      setMessages((prevMessages) => [...prevMessages, message]);
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
      // if (newConnection) {
      //   newConnection.stop()
      //     .then(() => console.log("SignalR connection stopped")).catch((error) => console.error(error));
      // }
    };
  }, []);
   
  useEffect(() => {       
    const fetchUserList = async () => {
      try {
        const response = await fetch(`https://localhost:7137/Session/all?agentid=${props.userId}`);
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
      // Send a message to the hub
      connection.invoke("SendMessageToUser",selectedUserId, message)
        .catch((error) => console.error(error));
      //setMessage("");
    }
  }

  const handleUserSelect = (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
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
          <button className="btn btn-primary mt-2" onClick={getConnectionId}>ConnectionId</button>        
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