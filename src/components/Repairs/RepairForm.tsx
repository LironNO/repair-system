
import React, { useState, useEffect } from 'react';

interface RepairFormProps {
    repair?: Repair | null;
    onSubmit: (data: any) => Promise<void>;
    onClose: () => void;
}

export const RepairForm: React.FC<RepairFormProps> = ({ repair, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        serialNumber: repair?.serialNumber || '',
        customerName: repair?.customerName || '',
        phoneNumber: repair?.phoneNumber || '',
        voipNumber: repair?.voipNumber || '',
        repairType: repair?.repairType || 'hardware',
        networkType: repair?.networkType || '',
        hasWarranty: repair?.hasWarranty || false,
        description: repair?.description || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                    {repair ? 'עריכת תיקון' : 'תיקון חדש'}
                </h2>
                <button 
                    type="button"
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">מספר סידורי</label>
                    <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">שם לקוח</label>
                    <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    />
                </div>

                {/* המשך שדות הטופס... */}
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
                    {repair ? 'עדכן תיקון' : 'צור תיקון'}
                </button>
            </div>
        </form>
    );
};
