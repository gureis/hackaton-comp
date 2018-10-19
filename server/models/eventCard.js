const mongoose = require('mongoose')

const eventCardSchema = new mongoose.Schema({
    title: { type: String, required: true, minlength: 1 },
    text: { type: String, required: true, minlength: 10 },
    img: { type: String },
    price: { type: String, required: true },
    date: { type: Date, required: true },
    confirmed: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
});

const EventCard = mongoose.model('EventFeed', eventCardSchema);

module.exports = {
    EventCard
}