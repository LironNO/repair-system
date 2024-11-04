import React, { useEffect, useState } from 'react';
import { NotificationService } from '../utils/NotificationService';

interface Notification {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
    read: boolean;
}

interface NotificationCenterProps {
    onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    useEffect(() => {
        const notificationService = NotificationService.getInstance();
        const unsubscribe = notificationService.subscribe((notification) => {
            setNotifications(prev => [notification, ...prev]);
        });

        return () => unsubscribe();
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    return (
        <div className="fixed right-0 top-16 w-96 bg-white dark:bg-gray-800 shadow-lg rounded-l-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">התראות</h3>
                <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
            <div className="divide-y dark:divide-gray-700">
                {notifications.map(notification => (
                    <div 
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                    >
                        <div className="flex items-center mb-1">
                            <i className={`fas fa-${getNotificationIcon(notification.type)} mr-2 text-${getNotificationColor(notification.type)}`}></i>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <p className="text-sm">{notification.message}</p>
                    </div>
                ))}
                {notifications.length === 0 && (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        אין התראות חדשות
                    </div>
                )}
            </div>
        </div>
    );
};

function getNotificationIcon(type: string): string {
    switch (type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type: string): string {
    switch (type) {
        case 'success': return 'green-500';
        case 'warning': return 'yellow-500';
        case 'error': return 'red-500';
        default: return 'blue-500';
    }
}