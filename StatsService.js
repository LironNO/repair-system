
import Repair from '../models/Repair.js';
import FlashTask from '../models/FlashTask.js';
import User from '../models/User.js';

class StatsService {
    static async getDashboardStats() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const [
                activeRepairs,
                completedToday,
                warrantyRepairs,
                avgRepairTime,
                technicianStats
            ] = await Promise.all([
                // מספר תיקונים פעילים
                Repair.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
                
                // תיקונים שהושלמו היום
                Repair.countDocuments({
                    status: 'completed',
                    'returnDetails.returnDate': { $gte: today }
                }),
                
                // תיקונים באחריות
                Repair.countDocuments({ hasWarranty: true, status: { $ne: 'returned' } }),
                
                // זמן תיקון ממוצע
                this.calculateAverageRepairTime(),
                
                // סטטיסטיקות טכנאים
                this.getTechnicianStats()
            ]);

            return {
                activeRepairs,
                completedToday,
                warrantyRepairs,
                avgRepairTime,
                technicianStats,
                repairsByType: await this.getRepairsByType(),
                monthlyStats: await this.getMonthlyStats()
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw error;
        }
    }

    static async calculateAverageRepairTime() {
        const completedRepairs = await Repair.find({
            status: 'completed',
            createdAt: { $exists: true },
            'returnDetails.returnDate': { $exists: true }
        });

        if (completedRepairs.length === 0) return 0;

        const totalTime = completedRepairs.reduce((sum, repair) => {
            const startTime = new Date(repair.createdAt);
            const endTime = new Date(repair.returnDetails.returnDate);
            return sum + (endTime - startTime);
        }, 0);

        return Math.round(totalTime / completedRepairs.length / (1000 * 60 * 60)); // שעות
    }

    static async getTechnicianStats() {
        const technicians = await User.find({ role: 'technician' });
        const stats = [];

        for (const tech of technicians) {
            const completedRepairs = await Repair.countDocuments({
                technician: tech._id,
                status: 'completed'
            });

            const activeRepairs = await Repair.countDocuments({
                technician: tech._id,
                status: { $in: ['pending', 'in_progress'] }
            });

            stats.push({
                technician: tech.name,
                completedRepairs,
                activeRepairs,
                efficiency: await this.calculateTechnicianEfficiency(tech._id)
            });
        }

        return stats;
    }

    static async getRepairsByType() {
        const hardwareRepairs = await Repair.countDocuments({ repairType: 'hardware' });
        const networkRepairs = await Repair.countDocuments({ repairType: 'network' });

        return {
            hardware: hardwareRepairs,
            network: networkRepairs,
            networkTypes: await this.getNetworkTypeDistribution()
        };
    }

    static async getNetworkTypeDistribution() {
        return await Repair.aggregate([
            { $match: { repairType: 'network' } },
            { $group: { _id: '$networkType', count: { $sum: 1 } } }
        ]);
    }

    static async getMonthlyStats() {
        const months = await Repair.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                        }
                    },
                    warranty: {
                        $sum: {
                            $cond: ['$hasWarranty', 1, 0]
                        }
                    }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        return months.map(month => ({
            year: month._id.year,
            month: month._id.month,
            total: month.total,
            completed: month.completed,
            warranty: month.warranty
        }));
    }

    static async calculateTechnicianEfficiency(techId) {
        const completedRepairs = await Repair.find({
            technician: techId,
            status: 'completed'
        });

        if (completedRepairs.length === 0) return 0;

        const totalTime = completedRepairs.reduce((sum, repair) => {
            const start = new Date(repair.createdAt);
            const end = new Date(repair.returnDetails.returnDate);
            return sum + (end - start);
        }, 0);

        return Math.round((completedRepairs.length / totalTime) * 1000000); // יעילות יחסית
    }
}

export default StatsService;
