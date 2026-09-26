const path = require('path')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const platform = require('./platform.middleware')
const faqs = require('./faq.data')
// const bodyParser = require('body-parser')

const limiter = rateLimit.rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})

const app = express()

// views/ and public/ sit at the web root, a level above src/
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', 'views'))
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use(helmet())
app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())
app.use(platform)

app.get('/', limiter, (req, res)=>{
    res.render('index', {
        title: 'àjọr — save together, reach your goal',
        description: 'Ajo, esusu and adashe on your phone. Every member sees every kobo, at any time.',
        faqs,
    })
})

module.exports = app