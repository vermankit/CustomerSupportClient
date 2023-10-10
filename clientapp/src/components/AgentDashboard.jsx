import React, { useState,useEffect } from 'react';
import AgentChatWindow from './AgentChatWindow';
const AgentDashboard = () => {

    const [agentName, setAgentName] = useState('');
    const [agentId, setAgentId] = useState(null);
    const [showChatWindow,setChatWindow] = useState(false);
    const [showError, setShowError] = useState(false);
    const [usersList,setUserList] = useState([]);
    const handleNameChange = (event) => {
        setAgentName(event.target.value);
    };    
    
    const handleOpenChatWindow = ( ) => {
        setChatWindow(true);             
    }

    const handleLogin = async () => {
        try {
          const response = await fetch('https://localhost:7137/Session/agent-login', {
            method: 'POST',
            headers: {
              'Accept': '*/*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(agentName), 
          });
    
          if (response.ok) {
            const agentId = await response.json();
            setAgentId(agentId);
            setChatWindow(true);
            setShowError(false);
            console.log(`Agent logged In ID: ${agentId}`);
          } else {
            setShowError(true);
            console.error('Failed to login.');
          }
        } catch (error) {
          console.error('Failed to login.', error);
        }
      };


  
    return (
        <div className='container'> 

        {!showChatWindow && (<div className='form-group'>
            <input
                type='text'
                className='form-control'
                placeholder=' Please enter agent id'
                id='AgentId' value={agentName}
                onChange={handleNameChange}
            />
            <button type='button' className='btn btn-primary' onClick={handleLogin}>
                Login 
            </button>
        </div>)
        }
        {showError && (
        <div>                 
               Please enter valid agent as per correct shift     
        </div>)
        }

        

        {showChatWindow && (
        <div>             
           <AgentChatWindow userId={agentId} name={agentName}/>            
        </div>
      )}
        </div>
    )
}

export default AgentDashboard;