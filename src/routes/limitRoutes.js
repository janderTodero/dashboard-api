const express = require('express')
const { changeLimit, createLimit, getLimit } = require('../controllers/limitController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

router.use(authMiddleware)

router.get("/", getLimit)
router.post("/", createLimit)
router.put("/", changeLimit)

module.exports = router