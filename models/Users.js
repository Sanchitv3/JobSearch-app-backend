const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    lastname: String,
    category : String,
    verificationCode: String,
    verificationCodeExpires: Date,
});

const UserModel = mongoose.model('register', UserSchema);

module.exports = UserModel;
