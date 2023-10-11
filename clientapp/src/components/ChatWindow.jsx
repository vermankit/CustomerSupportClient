import React, { useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";

function ChatWindow(props) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [agentData, setAgentData] = useState({});
  const [agentConnected, setAgentConnected] = useState(false);
  const [sessionterminated, setSessionterminated] = useState(false);
  const [poolCount, setPoolCount] = useState(0);
  const [connectionId,setConnectionId] = useState("");

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/chathub`, {
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
            retryTimeout = setTimeout(tryConnectToAgent, 5000);  
          }
        })
        .catch((error) => {
          console.error('Error retrieving connection ID:', error);
        });
    }; 

    newConnection.on("SessionTerminated", () => {
      // Handle the received message
      setSessionterminated(true);
    });

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
   
  useEffect(() => {
    const pollAPI = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_ENDPOINT}/Session/Poll?userId=${props.userId}`);
        if (response.ok) {
          const data = await response.json();
          if(data == false){
            sessionterminated(true);
          }
        } else {
          console.error('Failed to poll API');
        }
      } catch (error) {
        console.error('Error while polling API:', error);
      }
    };

    // Set up an interval to call the API every second
    const pollInterval = setInterval(pollAPI, 3000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(pollInterval);
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
            
            {sessionterminated  ? "Session got terminated please raise new support request" :
            agentConnected === false ? (
              <p>{poolCount >= 2 ? "Agent busy please try after sometime !" : "Connecting to agent please wait..."}</p>
            ) : (
              <div>
                  <p>You are connect to {agentData.name}</p>
                 <button className="btn btn-primary mt-2" onClick={sendMessage}>Send</button>
                 {/* <button className="btn btn-primary mt-2" onClick={getConnectionId}>ConnectionId</button> */}
                </div>

            )
              }


           
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
