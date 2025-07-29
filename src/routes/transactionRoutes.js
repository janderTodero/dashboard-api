const express = require('express')
const { create, getAllTransactions, readTransaction } = require('../controllers/transactionController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

router.use(authMiddleware)

router.post("/", create)
router.get("/", getAllTransactions)
router.get("/:id", readTransaction)

module.exports = router