const _ = require('lodash')
const fs = require('file-system')
const {ObjectID} = require('mongodb')
const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
require('./db/mongoose')
const {FeedCard} = require('./models/feedCard')
const {EventCard} = require('./models/eventCard')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // error first callback
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {

        // error first callback
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg')
        cb(null, true);
    else
        cb(null, false);
}

const upload = multer({ 
    storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter
});

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('uploads'));

// METHODS /home

app.post('/home', upload.single('img'), (req, res) => {
    const body = _.pick(req.body, ['title', 'text']);
    const card = new FeedCard({
        title: body.title,
        text: body.text,
        img: req.file.filename
    });
    card.save().then(doc => {
        res.status(200).send({ success: 'Post succesfully created!' });
    }, e => {
        res.status(400);
    });
});

app.get('/home', (req, res) => {
    FeedCard.find({})
        .then(feedCards => {
            feedCards = feedCards.map(card => {
                return {
                    _id: card._id,
                    img: card.img,
                    title: card.title,
                    likes: card.likes
                }
            });
            res.status(200).send({feedCards});
            });
        }, e => res.status(400));

app.get('/home/:id', (req, res) => {
    const id = req.params.id;
    if(!ObjectID.isValid(id)) {
        return res.status(400).send({ error: 'ID is invalid' });
    }
    FeedCard.findById(id).then(card => {
        if(!card)
            return res.status(404).send({ error: 'ID was not found' });
        res.status(200).send({card});
    });
});

app.delete('/home/:id', (req, res) => {
    const id = req.params.id;
    if(!ObjectID.isValid(id))
        return res.status(400).send({ error: 'ID is invalid'});
    FeedCard.findOneAndDelete({_id: id }).then(card => {
        if(!card)
            return res.status(404).send({ error:'ID was not found' });          
        fs.unlink(`./uploads/${card.img}`, err => {
            if (err) {throw err;}
            console.log(`./uploads/${card.img} was deleted`);
        });
        res.status(200).send({ success: 'Post succesfully removed' });
    });
});

//Update likes de um card
app.patch('/home/:id', (req, res) => {
    const id = req.params.id;

    if(!ObjectID.isValid(id))
        return res.status(400).send({ error: 'ID is invalid' });
   
    const updates = {
        likes: 1
    };
    const options = {
        new: true
    };
    FeedCard.findOneAndUpdate({_id: id}, {$inc: updates}, options)
        .then(updatedCard => {
            if(!updatedCard)
                return res.status(404).send({ error: 'ID was not found' });
            return res.status(200).send(updatedCard)
        }).catch(e => res.status(400).send());
});

// METHODS /events

app.post('/events', upload.single('img'), (req, res) => {
    const body = _.pick(req.body, ['title', 'text', 'date', 'price']);
    const card = new EventCard({
        title: body.title,
        text: body.text,
        img: req.file.filename,
        date: new Date(body.date),
        price: body.price
    });
    card.save().then(doc => {
        res.status(200).send({ success: 'Post succesfully created!' });
    }, e => {
        res.status(400);
    });
});

app.get('/events', (req, res) => {
    EventCard.find()
        .then(eventCards => {
            eventCards = eventCards.map(card => {
                return {
                    _id: card._id,
                    img: card.img,
                    title: card.title,
                    confirmed: card.confirmed,
                    date: card.date
                }
            });
            res.status(200).send({ eventCards });
        })
});

app.get('/events/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send({ error: 'ID is invalid' });
    }
    EventCard.findById(id).then(card => {
        if (!card)
            return res.status(404).send({ error: 'ID was not found' });
        res.status(200).send({ card });
    }).catch(e => res.status(400).send());
});

app.delete('/events/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id))
        return res.status(400).send({ error: 'ID is invalid' });
    EventCard.findOneAndDelete({ _id: id }).then(card => {
        if (!card)
            return res.status(404).send({ error: 'ID was not found' });
        fs.unlink(`./uploads/${card.img}`, err => {
            if (err) { throw err; }
            console.log(`./uploads/${card.img} was deleted`);
        });
        res.status(200).send({ success: 'Event succesfully removed' });
    });
});

app.patch('/events/likes/:id', (req, res) => {
    const id = req.params.id;
    if(!ObjectID.isValid(id))
        return res.status(400).send({ error: 'ID is invalid' });
    
    const updates = {
        likes: 1
    };
    const options = {
        new: true
    };
    EventCard.findOneAndUpdate({ _id: id }, { $inc: updates }, options)
        .then(updatedCard => {
            if(!updatedCard)
                return res.status(404).send({ error: 'ID was not found' });
            return res.status(200).send(updatedCard)
        }).catch(e => res.status(400).send());
});

app.patch('/events/confirmed/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id))
        return res.status(400).send({ error: 'ID is invalid' });

    const updates = {
        confirmed: 1
    };
    const options = {
        new: true
    };
    EventCard.findOneAndUpdate({ _id: id }, { $inc: updates }, options)
        .then(updatedCard => {
            if (!updatedCard)
                return res.status(404).send({ error: 'ID was not found' });
            return res.status(200).send(updatedCard)
        }).catch(e => res.status(400).send());
});

// METHODS /products

app.post('/products', (req, res) => {
    const body = _.pick(req.body, ['title', 'text', 'date', 'price']);
    const card = new EventCard({
        title: body.title,
        text: body.text,
        img: req.file.filename,
        date: new Date(body.date),
        price: body.price
    });
    card.save().then(doc => {
        res.status(200).send({ success: 'Post succesfully created!' });
    }, e => {
        res.status(400);
    });
});

app.listen(port, () => {
    console.log(`Server started at port ${port}`);    
});

module.exports = {
    app
}