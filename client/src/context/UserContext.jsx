import React, { createContext, useState, useContext } from 'react';

export const USERS = [
  { id: 1, name: 'Support Admin', role: 'System Administrator', avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=Admin&backgroundColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49' },
  { id: 2, name: 'Alex (Hardware Specialist)', role: 'Hardware Specialist', avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=Alex&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffffb1' },
  { id: 3, name: 'Sam (Software Engineer)', role: 'Software Engineer', avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=Sam&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede,b6e3f4' },
  { id: 4, name: 'Taylor (Network Admin)', role: 'Network Admin', avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=Taylor&backgroundColor=f88c49,f1f4dc,69d2e7,1c799f,0a5b83' },
  { id: 5, name: 'Casey (SecOps)', role: 'Security Analyst', avatar: 'https://api.dicebear.com/9.x/shapes/svg?seed=Casey&backgroundColor=ffffb1,ffd5dc,d1d4f9,c0aede,b6e3f4' }
];

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(USERS[0]);

  const switchUser = (userId) => {
    const user = USERS.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  return (
    <UserContext.Provider value={{ currentUser, switchUser, users: USERS }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
