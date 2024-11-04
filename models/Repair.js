const mongoose = require('mongoose');

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
    networkType: String,
    hasWarranty: Boolean,
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'returned'],
        default: 'pending'
    },
    technician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    history: [{
        action: String,
        date: { type: Date, default: Date.now },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        details: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Repair', repairSchema);