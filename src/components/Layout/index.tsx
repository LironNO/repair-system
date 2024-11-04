import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { NotificationCenter } from '../NotificationCenter';
import { useAuthStore } from '../../stores/authStore';

export const Layout: React.FC = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const user = useAuthStore(state => state.user);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    onNotificationClick={() => setShowNotifications(!showNotifications)}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
                {showNotifications && (
                    <NotificationCenter onClose={() => setShowNotifications(false)} />
                )}
            </div>
        </div>
    );
};

export default Layout;