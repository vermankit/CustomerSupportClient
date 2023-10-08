import React, { useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";

function ChatWindow() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); 
  const [connection,setConnection] = useState(null);  
  const [connectionId,setConnectionId] = useState(null);  
  
   useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7137/chathub",{
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    setConnection(newConnection);

    newConnection.start()
      .then(() => {
        
        newConnection.invoke('GetConnectionId') // Replace with your hub method to retrieve the connection ID
        .then((id) => {
          setConnectionId(id);
        })
        .catch((error) => {
          console.error('Error retrieving connection ID:', error);
        });
        newConnection.on("ReceiveMessage", (message) => {
          setMessages([...messages, message]);
        });
      })
      .catch((error) => console.error(error));    
      
     
    return () => {
      //Cleanup: stop the SignalR connection when the component unmounts
      if (newConnection) {
        newConnection.stop()
          .then(() => console.log("SignalR connection stopped"))
          .catch((error) => console.error(error));
      }
    };
  }, []);




  const sendMessage = () => {
    if (message) {
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
            <label>Connection ID: {connectionId}</label>
            <input
              type="text"
              className="form-control"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="btn btn-primary mt-2" onClick={sendMessage}>Send</button>
          </div>
          <ul className="list-group mt-3">
            {messages.map((message, index) => (
              <li key={index} className="list-group-item">{message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
