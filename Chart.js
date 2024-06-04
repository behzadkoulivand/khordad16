const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
    id:{
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    parent: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("Chart", chartSchema);