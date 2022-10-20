const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/mb_db')

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: {
    type: String,
    set(val) {
      return require('bcrypt').hashSync(val, 10)
    }
  },
  token: { type: String },
  level: { type: Number }
})
const User = mongoose.model('User', UserSchema)

const CommentsSchema = new mongoose.Schema({
  username: { type: String },
  content: { type: String },
  submit_time: { type: String },
  status: { type: Boolean },
});
const Comments = mongoose.model('Comments', CommentsSchema)

module.exports = { User, Comments }