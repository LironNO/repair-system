
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class UserService {
    async createUser(userData) {
        try {
            const existingUser = await User.findOne({ username: userData.username });
            if (existingUser) {
                throw new Error('שם משתמש כבר קיים במערכת');
            }

            const user = new User(userData);
            await user.save();

            return {
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async updateUser(userId, updates) {
        try {
            // אם מעדכנים סיסמה, יש להצפין אותה
            if (updates.password) {
                updates.password = await bcrypt.hash(updates.password, 10);
            }

            const user = await User.findByIdAndUpdate(
                userId,
                updates,
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                throw new Error('משתמש לא נמצא');
            }

            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const user = await User.findById(userId);
            
            if (!user) {
                throw new Error('משתמש לא נמצא');
            }

            if (user.role === 'admin') {
                // בדיקה שנשאר לפחות מנהל אחד במערכת
                const adminCount = await User.countDocuments({ role: 'admin' });
                if (adminCount <= 1) {
                    throw new Error('לא ניתן למחוק את המנהל האחרון במערכת');
                }
            }

            await user.deleteOne();
            return { message: 'משתמש נמחק בהצלחה' };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    async getUserStats(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                throw new Error('משתמש לא נמצא');
            }

            // Statistics calculation will be implemented here
            const stats = {
                totalRepairs: 0,
                completedRepairs: 0,
                activeRepairs: 0,
                averageRepairTime: 0
            };

            return {
                user,
                stats
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('משתמש לא נמצא');
            }

            const isValidPassword = await bcrypt.compare(oldPassword, user.password);
            if (!isValidPassword) {
                throw new Error('סיסמה נוכחית שגויה');
            }

            user.password = newPassword;
            await user.save();

            return { message: 'סיסמה שונתה בהצלחה' };
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    async resetPassword(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('משתמש לא נמצא');
            }

            const tempPassword = Math.random().toString(36).slice(-8);
            user.password = tempPassword;
            await user.save();

            return { tempPassword };
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }
}

export default new UserService();
