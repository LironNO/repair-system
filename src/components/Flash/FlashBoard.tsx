import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuthStore } from '../../stores/authStore';
import { NotificationService } from '../../utils/NotificationService';

interface FlashTask {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed';
    assignedTo: string;
    createdAt: Date;
}

export const FlashBoard: React.FC = () => {
    const [tasks, setTasks] = useState<FlashTask[]>([]);
    const { user } = useAuthStore();
    const notificationService = NotificationService.getInstance();

    useEffect(() => {
        fetchTasks();
        const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/flash`);
        
        ws.onmessage = (event) => {
            const newTask = JSON.parse(event.data);
            setTasks(prev => [...prev, newTask]);
            notificationService.playNotificationSound();
        };

        return () => ws.close();
    }, []);

    const fetchTasks = async () => {
        const response = await fetch('/api/flash');
        const data = await response.json();
        setTasks(data);
    };

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;

        const newTasks = Array.from(tasks);
        const [removed] = newTasks.splice(result.source.index, 1);
        newTasks.splice(result.destination.index, 0, removed);

        setTasks(newTasks);

        // Update task status based on column
        const newStatus = result.destination.droppableId;
        if (removed.status !== newStatus) {
            await updateTaskStatus(removed.id, newStatus);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pending Column */}
                <TaskColumn 
                    title="ממתין לטיפול" 
                    tasks={tasks.filter(t => t.status === 'pending')}
                    status="pending"
                />
                
                {/* In Progress Column */}
                <TaskColumn 
                    title="בטיפול" 
                    tasks={tasks.filter(t => t.status === 'in_progress')}
                    status="in_progress"
                />
                
                {/* Completed Column */}
                <TaskColumn 
                    title="הושלם" 
                    tasks={tasks.filter(t => t.status === 'completed')}
                    status="completed"
                />
            </div>
        </DragDropContext>
    );
};
