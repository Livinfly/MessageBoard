const { User, Comments } = require('./models')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const jwt = require('jsonwebtoken')
const SECRET = 'asjoiesdffh123wouaeniv124j91'

app.use(express.json())
app.use(require('cors')())
app.use(express.static(__dirname + '/public'))
// app.use(express.static('public/css'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.set('view')

// 注册
app.post('/api/register', async (req, res) => {
  const data = req.body
  if (!data.username.length) {
    return res.send('<h1>the username is empty!</h1><a href=" / ">返回</a>')
  }
  if (data.password.length < 6) {
    return res.send('<h1>the password must be longer than 6!</h1><a href="/">返回</a>')
  }
  const user = await User.findOne({
    username: data.username
  })
  if (!user) {
    const user = await User.create({
      username: data.username,
      password: data.password,
      level: 0
    });
    const token = jwt.sign({
      id: String(user._id),
    }, SECRET)
    const url = 'http://localhost:8080/comments/' + '?username=' + user.username + '&token=' + token
    res.redirect(url)
  }
  else {
    return res.send('<h1>the username has existed!</h1> <a href=" / ">返回</a>')
  }
})
// 登录
app.post('/api/login', async (req, res) => {
  if (req.headers.referer == 'http://localhost:8080/') {
    const data = req.body
    const user = await User.findOne({
      username: data.username
    })
    if (!user) {
      return res.send('<h1>the account doesn\'t existed!</h1 > <a href=" / ">返回</a>')
    }
    const isPasswordValid = require('bcrypt').compareSync(
      data.password,
      user.password
    )
    if (!isPasswordValid) {
      return res.send('<h1>the password is wrong!</h1><a href=" / ">返回</a>')
    }
    const token = jwt.sign({
      id: String(user._id),
    }, SECRET)
    const url = 'http://localhost:8080/comments/' + '?username=' + user.username + '&token=' + token
    res.redirect(url)
  }
  else {
    const data = req.body
    const user = await User.findOne({
      username: data.username
    })
    if (!user) {
      return res.send('<h1>the account doesn\'t existed!</h1 > <a href=" / ">返回</a>')
    }
    if (data.level < 1) {
      return res.send('<h1>the POWER account doesn\'t existed!</h1><a href=" / ">返回</a>')
    }
    const isPasswordValid = require('bcrypt').compareSync(
      data.password,
      user.password
    )
    if (!isPasswordValid) {
      return res.send('<h1>the password is wrong!</h1><a href=" / ">返回</a>')
    }
    const token = jwt.sign({
      id: String(user._id),
    }, SECRET)
    const url = 'http://localhost:8080/backyard'
    res.redirect(url)
  }
})
// 留言
app.post('/submit', async (req, res) => {
  const content = req.body.content
  const referer = String(req.headers.referer)
  if (content === '')
    return res.send('<h1>Content is empty!</h1><h1>Please try again!</h1><a href=' + referer + '>返回</a>')
  const username = referer.split('?')[1].split('&')[0].split('=')[1]
  const submit_time = new Date().toLocaleString()
  const user = await Comments.create({
    username: username,
    content: content,
    submit_time: submit_time,
    status: false
  });
  const tres = '<p>留言成功 等待审核</p>' + '<a href="' + referer + '">返回</a>'
  res.send(tres)
})
app.get('/cmts', async (req, res) => {
  // Comments.updateMany({ username: /.*/ }, { status: false }, (err, res) => {
  //   if (err) throw err
  //   console.log('ok')
  // })
  const data = await Comments.find()
  res.send(data)
})
app.get('/users', async (req, res) => {
  // User.updateMany({ username: admin }, { level: 2 }, (err, res) => {
  //   if (err) throw err
  //   console.log('ok')
  // })
  // User.updateOne({ username: "shichong" }, { level: 1 }, (err, res) => {
  //   if (err) throw err
  //   console.log('ok')
  // })
  const data = await User.find()
  res.send(data)
})
const auth = async (req, res, next) => {
  const raw = String(req.headers.authorization).split(' ').pop()
  const { id } = jwt.verify(raw, SECRET)
  req.user = await User.findById(id)
  next()
}
app.get('/api/profile', auth, async (req, res) => {
  res.send(req.user)
})
app.get('/comments', async (req, res) => {
  if (JSON.stringify(req.query) === '{}') {
    res.send('<p> 你还没有登录!</p> <a href="/">返回登录</a>')
  }
  else {
    const { username, token } = req.query
    const { id } = jwt.verify(token, SECRET)
    const user = await User.findById(id)
    if (user.username === username) {
      res.sendFile(__dirname + '/public/comments.html')
    }
  }
})
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})
app.get('/backyard', (req, res) => {
  if (req.headers.referer != 'http://localhost:8080/admin' && req.headers.referer != 'http://localhost:8080/backyard')
    return res.send('error')
  res.sendFile(__dirname + '/public/backyard.html')
})
let new_status = false
app.post('/cmtpass', async (req, res) => {
  if (req.headers.referer === 'http://localhost:8080/backyard') {
    const data = req.body
    // console.log(data)

    Comments.findOne({ username: data.username, submit_time: data.submit_time }, (err, res) => {
      if (err) throw err
      if (!res.status) new_status = true
      else new_status = false
    })
    Comments.updateOne({ username: data.username, submit_time: data.submit_time }, { status: new_status }, (err, res) => {
      if (err) throw err
      console.log('upd')
    })
  }
  else {
    res.send('error')
  }
})
app.post('/cmtdel', async (req, res) => {
  if (req.headers.referer === 'http://localhost:8080/backyard') {
    const data = req.body
    // console.log(data)

    Comments.findOne({ username: data.username, submit_time: data.submit_time }, (err, res) => {
      if (err) throw err
      if (!res.status) new_status = true
      else new_status = false
    })
    Comments.deleteOne({ username: data.username, submit_time: data.submit_time }, (err, res) => {
      if (err) throw err
      console.log('del')
    })
  }
  else {
    res.send('error')
  }
})
// User.collection.deleteMany({})
app.listen(8080, () => {
  console.log('App listening on port 8080')
})