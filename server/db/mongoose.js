const mongoose = require('mongoose')

const local = 'mongodb://localhost:27017/Atletica';

mongoose.connect(local, { useNewUrlParser: true });

module.exports = {
    mongoose
}