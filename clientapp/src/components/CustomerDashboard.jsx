import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
const CustomerDashboard = () => {
  const [customerName, setCustomerName] = useState('');
  const [userId, setUserId] = useState(null);
  const [showChatWindow,setChatWindow] = useState(false);
  const handleNameChange = (event) => {
    setCustomerName(event.target.value);
  }; 
  const createSupportRequest = async () => {
    const endpoint = import.meta.env.VITE_REACT_APP_ENDPOINT;
    try {
      const response = await fetch(`${endpoint}/Session/request-support`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerName), // Send customerName as a JSON string
      });

      if (response.ok) {
        const userId = await response.json();
        setUserId(userId);
        setChatWindow(true);
        console.log(`Support request created successfully. User ID: ${userId}`);
      } else {
        console.error('Failed to create a support request.');
      }
    } catch (error) {
      console.error('Error creating support request:', error);
    }
  };
;
  

  return (
    <div className='container'>     
      {!showChatWindow && ( 
        <div className='form-group'>      
          <input
            type='text'
            className='form-control'
            placeholder=' Please enter your name'
            id='customerName'  value={customerName}
            onChange={handleNameChange}
          />
          <button type='button' className='btn btn-primary' onClick={createSupportRequest}>
            Request live Support
          </button>
        </div>
      )}
     
      {userId && showChatWindow && (
        <div>
          <p>User ID: {userId}</p>
          <ChatWindow userId={userId} userName={customerName} /> {/* Render ChatWindow */}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
