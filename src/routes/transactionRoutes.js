const express = require('express')
const { create } = require('../controllers/transactionController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

router.use(authMiddleware)

router.post("/", create)

module.exports = router