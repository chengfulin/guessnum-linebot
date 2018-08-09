const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var GameRoomSchema = new Schema({
    player1: { type: String, required: true },
    player2: { type: String, 'default': null },
    roomName: { type: String, maxlength: 32, 'default': null },
    guessNumber: { type: String, required: true },
    isGameOn: { type: Boolean, required: true, 'default': false }
});

module.exports = mongoose.model('GameRoom', GameRoomSchema);