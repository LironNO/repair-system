
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { RepairForm } from './RepairForm';
import { RepairList } from './RepairList';
import { NotificationService } from '../../utils/NotificationService';

interface Repair {
    id: string;
    serialNumber: string;
    customerName: string;
    phoneNumber?: string;
    voipNumber?: string;
    repairType: 'hardware' | 'network';
    networkType?: string;
    hasWarranty: boolean;
    status: 'pending' | 'in_progress' | 'completed' | 'returned';
    description: string;
    technician: string;
    createdAt: Date;
    history: RepairHistory[];
}

export const RepairsPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: repairs, isLoading, refetch } = useQuery('repairs', fetchRepairs);

    const handleNewRepair = async (repairData: Partial<Repair>) => {
        try {
            const response = await fetch('/api/repairs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(repairData)
            });

            if (response.ok) {
                NotificationService.getInstance().sendNotification({
                    type: 'success',
                    message: 'תיקון חדש נוסף בהצלחה'
                });
                refetch();
                setShowForm(false);
                // הפעלת אנימציית קונפטי
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } catch (error) {
            console.error('Error creating repair:', error);
            NotificationService.getInstance().sendNotification({
                type: 'error',
                message: 'שגיאה ביצירת תיקון חדש'
            });
        }
    };

    const handleStatusUpdate = async (repairId: string, newStatus: string) => {
        try {
            await fetch(`/api/repairs/${repairId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            refetch();
            if (newStatus === 'completed') {
                confetti({
                    particleCount: 50,
                    spread: 60
                });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredRepairs = repairs?.filter(repair => {
        const matchesSearch = 
            repair.serialNumber.includes(searchTerm) ||
            repair.customerName.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || repair.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">ניהול תיקונים</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <i className="fas fa-plus mr-2"></i>
                    תיקון חדש
                </button>
            </div>

            <div className="flex gap-4 mb-4">
                <input
                    type="text"
                    placeholder="חיפוש..."
                    className="px-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="all">כל הסטטוסים</option>
                    <option value="pending">ממתין</option>
                    <option value="in_progress">בטיפול</option>
                    <option value="completed">הושלם</option>
                    <option value="returned">הוחזר</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center">
                    <div className="loader"></div>
                </div>
            ) : (
                <RepairList
                    repairs={filteredRepairs || []}
                    onStatusUpdate={handleStatusUpdate}
                    onEditRepair={setSelectedRepair}
                />
            )}

            {(showForm || selectedRepair) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
                        <RepairForm
                            repair={selectedRepair}
                            onSubmit={handleNewRepair}
                            onClose={() => {
                                setShowForm(false);
                                setSelectedRepair(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
