
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { NotificationService } from '../utils/NotificationService';

interface User {
    id: string;
    username: string;
    name: string;
    role: 'admin' | 'technician';
    lastLogin: Date;
}

export const UsersPage: React.FC = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();
    const notificationService = NotificationService.getInstance();

    const { data: users, isLoading } = useQuery<User[]>('users', async () => {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.json();
    });

    const addUserMutation = useMutation(
        async (userData: Partial<User>) => {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
            });
            return response.json();
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('users');
                notificationService.sendNotification({
                    type: 'success',
                    message: 'משתמש חדש נוסף בהצלחה'
                });
                setShowAddModal(false);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }
    );

    const updateUserMutation = useMutation(
        async (userData: Partial<User>) => {
            const response = await fetch(`/api/users/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
            });
            return response.json();
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('users');
                notificationService.sendNotification({
                    type: 'success',
                    message: 'משתמש עודכן בהצלחה'
                });
                setEditingUser(null);
            }
        }
    );

    const deleteUserMutation = useMutation(
        async (userId: string) => {
            await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('users');
                notificationService.sendNotification({
                    type: 'success',
                    message: 'משתמש נמחק בהצלחה'
                });
            }
        }
    );

    if (!currentUser?.role === 'admin') {
        return <div>אין לך הרשאות לצפות בדף זה</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">ניהול משתמשים</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <i className="fas fa-plus mr-2"></i>
                    משתמש חדש
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center">
                    <div className="loader"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    שם משתמש
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    שם מלא
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    תפקיד
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    התחברות אחרונה
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    פעולות
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users?.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {user.role === 'admin' ? 'מנהל' : 'טכנאי'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(user.lastLogin).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('האם למחוק משתמש זה?')) {
                                                    deleteUserMutation.mutate(user.id);
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal forms for add/edit */}
            {(showAddModal || editingUser) && (
                <UserFormModal
                    user={editingUser}
                    onSubmit={editingUser ? updateUserMutation.mutate : addUserMutation.mutate}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingUser(null);
                    }}
                />
            )}
        </div>
    );
};
