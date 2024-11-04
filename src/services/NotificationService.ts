
import WebSocket from 'ws';
import { Server } from 'http';
import { EventEmitter } from 'events';

interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: Date;
    targetUsers?: string[];
    metadata?: any;
}

export class NotificationService {
    private static instance: NotificationService;
    private wss: WebSocket.Server;
    private eventEmitter: EventEmitter;
    private clients: Map<string, WebSocket>;

    private constructor(server: Server) {
        this.wss = new WebSocket.Server({ server });
        this.eventEmitter = new EventEmitter();
        this.clients = new Map();

        this.wss.on('connection', (ws, req) => {
            const userId = this.getUserIdFromRequest(req);
            if (userId) {
                this.clients.set(userId, ws);

                ws.on('close', () => {
                    this.clients.delete(userId);
                });
            }
        });
    }

    public static getInstance(server?: Server): NotificationService {
        if (!NotificationService.instance && server) {
            NotificationService.instance = new NotificationService(server);
        }
        return NotificationService.instance;
    }

    public async sendNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
        const fullNotification = {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date()
        };

        // שמירת ההתראה במסד הנתונים
        await this.saveNotification(fullNotification);

        // שליחת ההתראה למשתמשים הרלוונטיים
        if (notification.targetUsers) {
            notification.targetUsers.forEach(userId => {
                const client = this.clients.get(userId);
                if (client) {
                    client.send(JSON.stringify(fullNotification));
                }
            });
        } else {
            // שליחה לכל המשתמשים אם לא צוינו משתמשים ספציפיים
            this.clients.forEach(client => {
                client.send(JSON.stringify(fullNotification));
            });
        }

        // הפעלת אירוע להאזנה חיצונית
        this.eventEmitter.emit('notification', fullNotification);
    }

    public onNotification(callback: (notification: Notification) => void) {
        this.eventEmitter.on('notification', callback);
        return () => this.eventEmitter.off('notification', callback);
    }

    private async saveNotification(notification: Notification) {
        // כאן מתבצעת שמירה במסד הנתונים
        try {
            // הוסף את הקוד לשמירה במונגו
            // ...
        } catch (error) {
            console.error('Error saving notification:', error);
        }
    }

    private getUserIdFromRequest(req: any): string | null {
        // קוד לחילוץ מזהה המשתמש מה-request
        // למשל מה-token
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                // Verify and decode token
                // Return user ID
            }
        } catch (error) {
            console.error('Error getting user ID:', error);
        }
        return null;
    }
}
