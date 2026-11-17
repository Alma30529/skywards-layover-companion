require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/auth', require('./routes/PasswordReset')) // each teammate mounts their own router here

app.listen(process.env.PORT || 4000, () => console.log('API running'))