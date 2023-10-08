import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CustomerDashboard from './components/CustomerDashboard';
import AgentDashboard from './components/AgentDashboard';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <div>
      <Router>
      <div>
        {/* Define your routes */}
        <Routes>
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/agent" element={<AgentDashboard />} />
        </Routes>
      </div>
    </Router>
    </div>
    //<ChatWindow></ChatWindow>
  );
}

export default App;
