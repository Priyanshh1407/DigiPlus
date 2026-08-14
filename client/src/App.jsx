import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import IncidentList from './components/IncidentList.jsx';
import IncidentForm from './components/IncidentForm.jsx';
import IncidentDetail from './components/IncidentDetail.jsx';

function App() {
  return (
    <UserProvider>
      <div className="h-full flex flex-col font-display tracking-tight antialiased selection:bg-primary-container selection:text-primary text-on-background bg-surface min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto w-full flex flex-col pb-24 container mx-auto px-4 pt-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<IncidentList />} />
            <Route path="/new" element={<IncidentForm />} />
            <Route path="/incident/:id" element={<IncidentDetail />} />
          </Routes>
        </main>
      </div>
    </UserProvider>
  );
}

export default App;
