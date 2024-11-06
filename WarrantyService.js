
import Repair from '../models/Repair.js';
import NotificationService from './NotificationService.js';
import moment from 'moment-timezone';

class WarrantyService {
    constructor() {
        this.notificationService = NotificationService.getInstance();
    }

    async checkWarrantyStatus(serialNumber) {
        try {
            const repair = await Repair.findOne({ serialNumber });
            if (!repair) {
                throw new Error('מחשב לא נמצא במערכת');
            }

            // לוגיקה לבדיקת אחריות מול HP
            const warrantyStatus = await this.checkHPWarranty(serialNumber);
            
            repair.hasWarranty = warrantyStatus.isValid;
            repair.warrantyDetails = {
                expirationDate: warrantyStatus.expirationDate,
                type: warrantyStatus.type,
                lastChecked: new Date()
            };

            await repair.save();
            return warrantyStatus;
        } catch (error) {
            console.error('Error checking warranty:', error);
            throw error;
        }
    }

    async checkHPWarranty(serialNumber) {
        // כאן תהיה אינטגרציה עם מערכת HP
        // לצורך הדוגמה נחזיר נתונים סטטיים
        const mockWarrantyCheck = {
            isValid: true,
            expirationDate: moment().add(1, 'year').toDate(),
            type: 'NBD',
            coverage: 'Full'
        };

        return mockWarrantyCheck;
    }

    async processWarrantyClaim(repairId) {
        try {
            const repair = await Repair.findById(repairId)
                .populate('technician', 'name');

            if (!repair) {
                throw new Error('תיקון לא נמצא');
            }

            if (!repair.hasWarranty) {
                throw new Error('המחשב אינו באחריות');
            }

            // יצירת קריאת שירות מול HP
            const serviceCall = await this.createHPServiceCall(repair);

            repair.warrantyClaimDetails = {
                serviceCallNumber: serviceCall.id,
                createdAt: new Date(),
                status: 'pending',
                expectedArrival: moment().add(1, 'day').toDate()
            };

            await repair.save();

            // שליחת התראה
            this.notificationService.sendNotification(
                'warranty',
                `נפתחה קריאת שירות ${serviceCall.id} עבור מחשב ${repair.serialNumber}`,
                [repair.technician._id]
            );

            return serviceCall;
        } catch (error) {
            console.error('Error processing warranty claim:', error);
            throw error;
        }
    }

    async createHPServiceCall(repair) {
        // אינטגרציה עם מערכת HP
        // לצורך הדוגמה נחזיר נתונים סטטיים
        return {
            id: `HP-${Date.now()}`,
            status: 'created',
            estimatedArrival: moment().add(1, 'day').toDate()
        };
    }

    async checkWarrantyClaimStatus(claimId) {
        // בדיקת סטטוס קריאת שירות
        // לצורך הדוגמה נחזיר סטטוס רנדומלי
        const statuses = ['pending', 'in_progress', 'technician_assigned', 'completed'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        return {
            status: randomStatus,
            lastUpdated: new Date(),
            details: `Status updated to ${randomStatus}`
        };
    }

    async getWarrantyStats() {
        const stats = {
            total: await Repair.countDocuments({ hasWarranty: true }),
            active: await Repair.countDocuments({ 
                hasWarranty: true,
                status: { $nin: ['completed', 'returned'] }
            }),
            claims: await Repair.countDocuments({ 
                hasWarranty: true,
                'warrantyClaimDetails.serviceCallNumber': { $exists: true }
            })
        };

        return stats;
    }
}

export default new WarrantyService();
