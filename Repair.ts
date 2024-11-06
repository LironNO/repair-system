
import mongoose from 'mongoose';

const repairHistorySchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    action: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    details: String
});

const repairSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: true,
        unique: true
    },
    customerName: {
        type: String,
        required: true
    },
    phoneNumber: String,
    voipNumber: String,
    repairType: {
        type: String,
        enum: ['hardware', 'network'],
        required: true
    },
    networkType: {
        type: String,
        enum: ['nes-harim', 'olympus', 'tokyo', 'atlas', 'edge', null],
        default: null
    },
    hasWarranty: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'returned'],
        default: 'pending'
    },
    description: String,
    technician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    history: [repairHistorySchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    returnDetails: {
        collectorName: String,
        signature: String,
        returnDate: Date
    }
});

export const Repair = mongoose.model('Repair', repairSchema);
 
