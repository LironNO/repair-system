
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface LogEntry {
    id: string;
    type: 'repair' | 'user' | 'system' | 'warranty';
    action: string;
    details: string;
    user: string;
    timestamp: Date;
    metadata?: any;
}

export const TimelinePage: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filter, setFilter] = useState('all');

    const { data: initialLogs } = useQuery('logs', fetchLogs);

    useEffect(() => {
        // התחברות ל-WebSocket לקבלת לוגים בזמן אמת
        const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/logs`);
        
        ws.onmessage = (event) => {
            const newLog = JSON.parse(event.data);
            setLogs(prev => [newLog, ...prev.slice(0, 99)]); // שמירת 100 הלוגים האחרונים
        };

        // אתחול הלוגים הראשוני
        if (initialLogs) {
            setLogs(initialLogs);
        }

        return () => ws.close();
    }, [initialLogs]);

    const getLogIcon = (type: string) => {
        switch (type) {
            case 'repair': return 'tools';
            case 'user': return 'user';
            case 'system': return 'cog';
            case 'warranty': return 'shield-alt';
            default: return 'info-circle';
        }
    };

    const getLogColor = (type: string) => {
        switch (type) {
            case 'repair': return 'blue';
            case 'user': return 'green';
            case 'system': return 'purple';
            case 'warranty': return 'yellow';
            default: return 'gray';
        }
    };

    const filteredLogs = logs.filter(log => 
        filter === 'all' || log.type === filter
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">לוח זמנים</h1>
                <div className="flex gap-2">
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="all">הכל</option>
                        <option value="repair">תיקונים</option>
                        <option value="user">משתמשים</option>
                        <option value="system">מערכת</option>
                        <option value="warranty">אחריות</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow divide-y">
                {filteredLogs.map(log => (
                    <div 
                        key={log.id} 
                        className="p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-start space-x-4 space-x-reverse">
                            <div className={`bg-${getLogColor(log.type)}-100 p-2 rounded-lg`}>
                                <i className={`fas fa-${getLogIcon(log.type)} text-${getLogColor(log.type)}-600`}></i>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{log.action}</p>
                                        <p className="text-sm text-gray-600">{log.details}</p>
                                    </div>
                                    <div className="text-sm text-gray-500 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(log.timestamp), { 
                                            addSuffix: true,
                                            locale: he 
                                        })}
                                    </div>
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                    ע"י {log.user}
                                </div>
                                {log.metadata && (
                                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                        <pre className="whitespace-pre-wrap">
                                            {JSON.stringify(log.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

async function fetchLogs() {
    const response = await fetch('/api/logs', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.json();
}
