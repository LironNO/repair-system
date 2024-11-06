
import { WebSocket } from 'ws';

class NotificationService {
    static instance = null;
    constructor() {
        this.clients = new Map();
    }

    static getInstance() {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    addClient(userId, ws) {
        this.clients.set(userId, ws);
    }

    removeClient(userId) {
        this.clients.delete(userId);
    }

    sendToUser(userId, notification) {
        const client = this.clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(notification));
        }
    }

    broadcast(notification) {
        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(notification));
            }
        });
    }

    sendNotification(type, message, targetUsers = null) {
        const notification = {
            type,
            message,
            timestamp: new Date()
        };

        if (targetUsers) {
            targetUsers.forEach(userId => {
                this.sendToUser(userId, notification);
            });
        } else {
            this.broadcast(notification);
        }
    }
}

export default NotificationService;
