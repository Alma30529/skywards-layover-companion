require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/] }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))
app.use('/auth', require('./routes/PasswordReset')) // each teammate mounts their own router here

app.listen(process.env.PORT || 4000, () => console.log('API running'))