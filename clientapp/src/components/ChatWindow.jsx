import React, { useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";

function ChatWindow(props) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [agentData, setAgentData] = useState({});
  const [agentConnected, setAgentConnected] = useState(false);
  const [poolCount, setPoolCount] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [connectionId,setConnectionId] = useState("");
  //Create SignalR connection
  // useEffect(() => {
  //   const newConnection = new signalR.HubConnectionBuilder()
  //     .withUrl("https://localhost:7137/chathub", {
  //       skipNegotiation: true,
  //       transport: signalR.HttpTransportType.WebSockets
  //     })
  //     .build();
  //   setConnection(newConnection);
  //   newConnection.start()
  //     .then(() => {        
  //       newConnection.invoke('ConnectToAgent', props.userId) 
  //       .then((response) => {
  //         console.log("Response from server:", response);
  //         if (response !== null) {  
  //           setAgentData(data);
  //           setAgentConnected(true);
  //           setPoolCount(0);
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('Error retrieving connection ID:', error);
  //       });        
  //     })
  //     .catch((error) => console.error(error));      

  //   return () => {     
  //     // if (newConnection) {
  //     //   newConnection.stop()
  //     //     .then(() => console.log("SignalR connection stopped")).catch((error) => console.error(error));
  //     // }
  //   };
  // }, []);
 
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7137/chathub", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();
    setConnection(newConnection);
    let retryTimeout; // Variable to hold the retry interval
    const tryConnectToAgent = () => {
      newConnection.invoke('ConnectToAgent', props.userId) 
        .then((response) => {
          console.log("Response from server:", response);
          if (response !== null) {  
            setAgentData(response);
            setAgentConnected(true);
            setPoolCount(0);
            clearTimeout(retryTimeout);
          } else {
            // If the response is null, retry after 5 seconds
            retryTimeout = setTimeout(tryConnectToAgent, 5000);  // Retry after 5 seconds (5000 milliseconds)
          }
        })
        .catch((error) => {
          console.error('Error retrieving connection ID:', error);
        });
    };
    
    newConnection.on("ReceiveMessage", (message) => {
      // Handle the received message
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    newConnection.start()
      .then(() => {
        tryConnectToAgent(); // Initial attempt to connect to agent
      })
      .catch((error) => console.error(error));
  
    return () => {
      if (newConnection) {
        newConnection.stop()
          .then(() => console.log("SignalR connection stopped"))
          .catch((error) => console.error(error));
      }
    };
  }, []);
  


  const sendMessage = () => {
    if (connection && message) {      
      connection.invoke("SendMessageToAgent",props.userId,agentData.id, message)
        .catch((error) => console.error(error));     
    }
  }

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
          <h3 className="card-title">Chat Window</h3>
          <h3 className="card-title">{connectionId}</h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label>Welcome: {props.userName}</label>
            <input
              type="text"
              className="form-control"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {agentConnected === false ? (
              <p>{poolCount >= 2 ? "Agent busy please try after sometime !" : "Connecting to agent please wait..."}</p>
            ) : (
              <div>
                  <p>You are connect to {agentData.name}</p>
                 <button className="btn btn-primary mt-2" onClick={sendMessage}>Send</button>
                 <button className="btn btn-primary mt-2" onClick={getConnectionId}>ConnectionId</button> 
                </div>
            
            )}
          </div>
        </div>
        <ul className="list-group mt-3">
          {messages.map((message, index) => (
            <li key={index} className="list-group-item">{message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ChatWindow;
