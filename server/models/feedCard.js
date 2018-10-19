const mongoose = require('mongoose')

const feedCardSchema = new mongoose.Schema({
    title: { type: String, required: true, minlength: 1 },
    text: { type: String, required: true, minlength: 10 },
    img: { type: String },
    likes: { type: Number, default: 0}
});

const FeedCard = mongoose.model('HomeFeed', feedCardSchema);

module.exports= {
    FeedCard
}