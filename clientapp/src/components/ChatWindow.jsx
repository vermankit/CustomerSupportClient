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
  //Create SignalR connection
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7137/chathub", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();
    setConnection(newConnection);
    newConnection.start()
      .then(() => {        
        newConnection.invoke('ConnectToAgent', props.userId) 
        .then((response) => {
          console.log("Response from server:", response);
          if (response !== null) {  
            setAgentData(data);
            setAgentConnected(true);
            setPoolCount(0);
          }
        })
        .catch((error) => {
          console.error('Error retrieving connection ID:', error);
        });        
      })
      .catch((error) => console.error(error));      

    return () => {     
      if (newConnection) {
        newConnection.stop()
          .then(() => console.log("SignalR connection stopped")).catch((error) => console.error(error));
      }
    };
  }, []);

  // useEffect(() => {
  //   if (connection) {    
  //     const callHubMethod = () => {       
  //       connection.invoke('ConnectToAgent', props.userId).then(response => {        
  //         console.log("Response from server:", response);
  //         if (response === null) {
  //           setPoolCount(prevCount => prevCount + 1);       
  //           if (poolCount === 2) {
  //             console.log("Received three consecutive null responses. Stopping connection.");
  //             connection.stop().catch(error => console.error(error));              
  //           }
  //         } else {
  //           setAgentData(data);
  //           setAgentConnected(true);
  //           setPoolCount(0);
  //         }
  //       }).catch(error => console.error(error));
  //     };
  //     callHubMethod();
  //     const Id = setInterval(callHubMethod, 5000); // 5000 milliseconds = 5 seconds
  //     setIntervalId(Id)
  //     return () => {
  //       // Clean up the interval when the component unmounts
  //       clearInterval(intervalId);
  //     };
  //   }
  // }, []);

  const sendMessage = () => {
    if (connection && message) {
      // Send a message to the hub
      connection.invoke("SendMessage", message)
        .catch((error) => console.error(error));
      //setMessage("");
    }
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Chat Window</h3>
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
              <button className="btn btn-primary mt-2" onClick={sendMessage}>Send</button>
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
