
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

class BackupService {
    constructor() {
        this.backupDir = path.join(process.cwd(), 'backups');
        this.initBackupDirectory();
    }

    async initBackupDirectory() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
        } catch (error) {
            console.error('Error creating backup directory:', error);
        }
    }

    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupDir, `backup-${timestamp}`);
        
        try {
            const { MONGODB_URI } = process.env;
            const command = `mongodump --uri="${MONGODB_URI}" --out="${backupPath}"`;
            
            await execAsync(command);
            
            // Zip the backup
            const zipCommand = `tar -czf "${backupPath}.tar.gz" -C "${backupPath}" .`;
            await execAsync(zipCommand);
            
            // Clean up uncompressed backup
            await fs.rm(backupPath, { recursive: true });
            
            // Keep only last 5 backups
            await this.cleanOldBackups();
            
            return `${backupPath}.tar.gz`;
        } catch (error) {
            console.error('Backup failed:', error);
            throw new Error('Backup failed');
        }
    }

    async cleanOldBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            const backups = files
                .filter(file => file.endsWith('.tar.gz'))
                .map(file => ({
                    name: file,
                    path: path.join(this.backupDir, file),
                    time: fs.stat(path.join(this.backupDir, file)).mtime
                }));

            if (backups.length > 5) {
                const oldBackups = backups
                    .sort((a, b) => b.time - a.time)
                    .slice(5);

                for (const backup of oldBackups) {
                    await fs.unlink(backup.path);
                }
            }
        } catch (error) {
            console.error('Error cleaning old backups:', error);
        }
    }

    async restoreBackup(backupFile) {
        try {
            const backupPath = path.join(this.backupDir, path.basename(backupFile, '.tar.gz'));
            
            // Extract backup
            await execAsync(`tar -xzf "${backupFile}" -C "${backupPath}"`);
            
            // Restore from extracted backup
            const { MONGODB_URI } = process.env;
            await execAsync(`mongorestore --uri="${MONGODB_URI}" "${backupPath}"`);
            
            // Clean up
            await fs.rm(backupPath, { recursive: true });
            
            return true;
        } catch (error) {
            console.error('Restore failed:', error);
            throw new Error('Restore failed');
        }
    }

    async getBackupsList() {
        try {
            const files = await fs.readdir(this.backupDir);
            const backups = await Promise.all(
                files
                    .filter(file => file.endsWith('.tar.gz'))
                    .map(async file => {
                        const stats = await fs.stat(path.join(this.backupDir, file));
                        return {
                            name: file,
                            size: stats.size,
                            createdAt: stats.mtime
                        };
                    })
            );

            return backups.sort((a, b) => b.createdAt - a.createdAt);
        } catch (error) {
            console.error('Error getting backups list:', error);
            return [];
        }
    }
}

export default new BackupService();
