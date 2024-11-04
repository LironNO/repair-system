
import React from 'react';
import { useQuery } from 'react-query';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Pie } from 'react-chartjs-2';
import { StatisticsCard } from './StatisticsCard';

export const DashboardPage: React.FC = () => {
    const { data: stats, isLoading } = useQuery('dashboard-stats', fetchDashboardStats);
    const { data: repairs } = useQuery('recent-repairs', fetchRecentRepairs);

    const chartData = {
        labels: ['בטיפול', 'הושלם', 'ממתין', 'הוחזר'],
        datasets: [{
            data: [
                stats?.inProgress || 0,
                stats?.completed || 0,
                stats?.pending || 0,
                stats?.returned || 0
            ],
            backgroundColor: [
                '#3B82F6', // כחול
                '#10B981', // ירוק
                '#F59E0B', // כתום
                '#6B7280'  // אפור
            ]
        }]
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold mb-6">לוח בקרה</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatisticsCard
                    title="תיקונים פעילים"
                    value={stats?.activeRepairs || 0}
                    trend={stats?.activeRepairsTrend || 0}
                    icon="tools"
                />
                <StatisticsCard
                    title="הושלמו החודש"
                    value={stats?.completedThisMonth || 0}
                    trend={stats?.completedTrend || 0}
                    icon="check-circle"
                />
                <StatisticsCard
                    title="ממוצע זמן טיפול"
                    value={`${stats?.avgRepairTime || 0} שעות`}
                    trend={stats?.avgTimeTrend || 0}
                    icon="clock"
                />
                <StatisticsCard
                    title="באחריות"
                    value={stats?.warrantyCount || 0}
                    trend={stats?.warrantyTrend || 0}
                    icon="shield-alt"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">סטטיסטיקת תיקונים</h3>
                    <Pie data={chartData} options={{ 
                        plugins: { 
                            legend: { position: 'bottom' }
                        } 
                    }} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">תיקונים אחרונים</h3>
                    <div className="space-y-4">
                        {repairs?.map(repair => (
                            <div key={repair.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                    <p className="font-medium">{repair.serialNumber}</p>
                                    <p className="text-sm text-gray-500">{repair.customerName}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(repair.status)}`}>
                                    {getStatusText(repair.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">זמני טיפול לפי סוג</h3>
                <Bar
                    data={{
                        labels: ['חומרה', 'רשת', 'אחריות'],
                        datasets: [{
                            label: 'זמן טיפול ממוצע (שעות)',
                            data: [
                                stats?.avgTimeHardware || 0,
                                stats?.avgTimeNetwork || 0,
                                stats?.avgTimeWarranty || 0
                            ],
                            backgroundColor: '#3B82F6'
                        }]
                    }}
                    options={{
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

function getStatusColor(status: string): string {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'in_progress': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'returned': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getStatusText(status: string): string {
    switch (status) {
        case 'pending': return 'ממתין';
        case 'in_progress': return 'בטיפול';
        case 'completed': return 'הושלם';
        case 'returned': return 'הוחזר';
        default: return status;
    }
}

async function fetchDashboardStats() {
    const response = await fetch('/api/dashboard/stats');
    return response.json();
}

async function fetchRecentRepairs() {
    const response = await fetch('/api/repairs/recent');
    return response.json();
}
