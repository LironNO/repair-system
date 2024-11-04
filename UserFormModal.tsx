
import React, { useState, useEffect } from 'react';

interface UserFormModalProps {
    user?: User | null;
    onSubmit: (userData: Partial<User>) => void;
    onClose: () => void;
}

interface User {
    id?: string;
    username: string;
    name: string;
    role: 'admin' | 'technician';
    password?: string;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ user, onSubmit, onClose }) => {
    const [formData, setFormData] = useState<Partial<User>>({
        username: user?.username || '',
        name: user?.name || '',
        role: user?.role || 'technician',
        password: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.username) {
            newErrors.username = 'שם משתמש הוא שדה חובה';
        }
        if (!formData.name) {
            newErrors.name = 'שם מלא הוא שדה חובה';
        }
        if (!user && !formData.password) {
            newErrors.password = 'סיסמה היא שדה חובה';
        }
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'סיסמה חייבת להכיל לפחות 6 תווים';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                ...formData,
                id: user?.id
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {user ? 'עריכת משתמש' : 'הוספת משתמש חדש'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            שם משתמש
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg ${errors.username ? 'border-red-500' : ''}`}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            שם מלא
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : ''}`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            תפקיד
                        </label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'technician' }))}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="technician">טכנאי</option>
                            <option value="admin">מנהל</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {user ? 'סיסמה חדשה (השאר ריק לשמירת הסיסמה הקיימת)' : 'סיסמה'}
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg ${errors.password ? 'border-red-500' : ''}`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            {user ? 'עדכן משתמש' : 'צור משתמש'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
