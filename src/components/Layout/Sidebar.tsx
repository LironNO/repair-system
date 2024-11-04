import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Pacman } from '../Animations/Pacman';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark-mode');
    };

    const menuItems = [
        { path: '/repairs', icon: 'tools', text: 'רשימת תיקונים' },
        { path: '/dashboard', icon: 'chart-bar', text: 'לוח בקרה' },
        { path: '/timeline', icon: 'history', text: 'לוח זמנים' },
        { path: '/flash', icon: 'bolt', text: 'פלאש' },
        { path: '/faq', icon: 'question-circle', text: 'שאלות נפוצות' },
    ];

    if (user?.role === 'admin') {
        menuItems.push({ path: '/users', icon: 'users', text: 'ניהול משתמשים' });
    }

    return (
        <aside className="high-tech-sidebar w-64 min-h-screen">
            <div className="p-4">
                <div className="flex items-center mb-8">
                    <Pacman />
                    <h1 className="text-xl font-bold text-white">8200 - מעבדה</h1>
                </div>
                
                <nav>
                    <ul className="space-y-4">
                        {menuItems.map(item => (
                            <li key={item.path}>
                                <Link 
                                    to={item.path}
                                    className={`flex items-center text-gray-300 hover:text-white transition-colors ${
                                        location.pathname === item.path ? 'text-white' : ''
                                    }`}
                                >
                                    <i className={`fas fa-${item.icon} mr-2`}></i>
                                    <span>{item.text}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="absolute bottom-4 w-52">
                    <button 
                        onClick={toggleDarkMode}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                    >
                        <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'} mr-2`}></i>
                        <span>{isDarkMode ? 'מצב רגיל' : 'מצב לילה'}</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar; 
