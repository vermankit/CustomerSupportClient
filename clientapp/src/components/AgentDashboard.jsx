import React, { useState } from 'react';
const AgentDashboard = () => {

    const [agentName, setAgentName] = useState('');
    const [agentId, setAgentId] = useState(null);
    const [showChatWindow,setChatWindow] = useState(false);

    const handleNameChange = (event) => {
        setAgentName(event.target.value);
    };

    const login = async () => {
        try {
            const response = await fetch('https://localhost:7137/Session/request-support', {
                method: 'POST',
                headers: {
                    'Accept': '*/*',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agentName),
            });

            if (response.ok) {
                const userId = await response.json();
                setAgentId(agentId);               
              
            } else {
                console.error('Failed to login.');
            }
        } catch (error) {
            console.error('Error creating support request:', error);
        }
    };


    return (
        <div className='container'> 
        <div className='form-group'>
            <input
                type='text'
                className='form-control'
                placeholder=' Please enter agent id'
                id='AgentId' value={agentName}
                onChange={handleNameChange}
            />
            <button type='button' className='btn btn-primary' onClick={login}>
                Login
            </button>
        </div>
        </div>
    )
}

export default AgentDashboard;