const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var favoriteSchema = new Schema({
    dishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish' //populate from db
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' //populate from db
    },
}, {
    timestamps: true,
});
var Favorites = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorites;