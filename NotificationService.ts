
import { EventEmitter } from 'events';

interface Notification {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
    read: boolean;
}

export class NotificationService {
    private static instance: NotificationService;
    private socket: WebSocket;
    private emitter: EventEmitter;

    private constructor() {
        this.emitter = new EventEmitter();
        this.connectWebSocket();
    }

    private connectWebSocket() {
        this.socket = new WebSocket(`${process.env.REACT_APP_WS_URL}/notifications`);
        
        this.socket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            this.emitter.emit('notification', notification);
        };

        this.socket.onclose = () => {
            // Reconnect after 5 seconds
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public subscribe(callback: (notification: Notification) => void): () => void {
        this.emitter.on('notification', callback);
        return () => this.emitter.off('notification', callback);
    }

    public async sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<void> {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(notification)
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    public playNotificationSound() {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(console.error);
    }
}
 
