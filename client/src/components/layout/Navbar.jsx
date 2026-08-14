import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext.jsx';

export default function Navbar() {
  const { currentUser, switchUser, users } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-surface border-b border-outline-variant/60 h-16 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/90 border-bottom-gradient">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary-btn flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
          </div>
          <span className="font-semibold text-lg text-primary tracking-tight">SupportDesk</span>
        </Link>
      </div>
      <div className="flex-1 hidden md:block"></div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 text-primary hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors hidden sm:block">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
        <button className="relative p-2 text-primary hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors hidden sm:block">
          <span className="material-symbols-outlined text-[22px]">help</span>
        </button>
        
        <div className="relative ml-2">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:bg-surface-container-low p-1.5 rounded-full transition-colors focus:outline-none"
          >
            <div className="flex flex-col text-right hidden md:flex">
              <span className="text-sm font-semibold text-on-surface leading-tight">{currentUser.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-primary font-bold leading-tight">{currentUser.role}</span>
            </div>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/50 hover:ring-2 hover:ring-primary/40 transition-all shadow-sm bg-white">
              <img alt="User profile" className="w-full h-full object-cover" src={currentUser.avatar}/>
            </div>
          </button>
          
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-64 bg-white border border-outline-variant/60 rounded-xl shadow-xl z-50 overflow-hidden animate-entrance">
                <div className="px-4 py-3 border-b border-outline-variant/30 bg-surface-container-lowest">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Switch User Context</p>
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { switchUser(u.id); setShowDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-surface-container-low flex items-center gap-3 transition-colors ${currentUser.id === u.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                    >
                      <img src={u.avatar} className="w-8 h-8 rounded-full object-cover border border-outline-variant/30" />
                      <div>
                        <div className={`text-sm font-medium ${currentUser.id === u.id ? 'text-primary font-semibold' : 'text-on-surface'}`}>{u.name}</div>
                        <div className="text-[10px] text-on-surface-variant leading-none mt-0.5">{u.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
