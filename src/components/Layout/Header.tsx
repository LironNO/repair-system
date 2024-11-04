import React from 'react';
import { useAuthStore } from '../../stores/authStore';

interface HeaderProps {
    onNotificationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNotificationClick }) => {
    const { user, logout } = useAuthStore();
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        // התחברות לWebSocket לקבלת התראות בזמן אמת
        const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/notifications`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
                setUnreadCount(prev => prev + 1);
            }
        };
        return () => ws.close();
    }, []);

    return (
        <header className="high-tech-header px-6 py-4 shadow-lg">
            <div className="flex justify-between items-center">
                <h2 id="pageTitle" className="text-xl font-bold text-white"></h2>
                <div className="flex items-center space-x-4">
                    <button 
                        className="relative"
                        onClick={onNotificationClick}
                    >
                        <i className="fas fa-bell text-white"></i>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <div className="text-white flex items-center space-x-3">
                        <span>{user?.name}</span>
                        <button 
                            onClick={logout}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                        >
                            התנתק
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 
