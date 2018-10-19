const mongoose = require('mongoose')

const productImage = new mongoose.Schema({ img: { type: String } });
const categories = new mongoose.Schema({ cat: { type: String,  } });

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, minlength: 1 },
    description: { type: String, required: true, minlength: 10 },
    images: [productImage],
    price: { type: Number, required: true },
    categories: [categories]
});

const Product = mongoose.model('ProducsFeed', productSchema);

module.exports = {
    Product
}