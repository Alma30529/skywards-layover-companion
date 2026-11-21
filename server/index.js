require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
// Local dev origins, plus any origins listed in CORS_ORIGIN (comma-separated), e.g. the Vercel site
const extraOrigins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/, ...extraOrigins] }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))
app.use('/auth', require('./routes/PasswordReset')) // each teammate mounts their own router here
app.use('/layover', require('./routes/layover'))
app.use('/auth', require('./routes/Auth')) // register, login, me (feature/register-login)

app.listen(process.env.PORT || 4000, () => console.log('API running'))