const path = require('path')
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const platform = require('./platform.middleware')
const faqs = require('./faq.data')

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
// Heroku's router sits in front of us; without this every visitor shares the router's IP
// and the rate limiter throttles the whole site as one client.
app.set('trust proxy', 1)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', 'views'))

// Before express.static so CSS/JS responses get the security headers too.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            // Fonts come from Google Fonts; Helmet's defaults allow any https: source.
            'style-src': ["'self'", 'https://fonts.googleapis.com'],
            'font-src': ["'self'", 'https://fonts.gstatic.com'],
            'frame-ancestors': ["'none'"],
        },
    },
    frameguard: { action: 'deny' },
}))
app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()')
    next()
})
app.use(express.static(path.join(__dirname, '..', 'public')))
app.use(morgan('tiny'))
app.use(platform)

app.get('/', limiter, (req, res)=>{
    res.render('index', {
        title: 'àjọr — save together, collect in turn, reach your goals',
        description: 'Run your group contributions without the chasing or the missing pot. Earn upto 20% interest on your targets, or pool with others.', faqs,
    })
})

module.exports = app