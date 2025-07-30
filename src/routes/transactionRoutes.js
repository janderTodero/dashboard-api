const express = require('express')
const { create, getAllTransactions, readTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

router.use(authMiddleware)

router.post("/", create)
router.get("/", getAllTransactions)
router.get("/:id", readTransaction)
router.put("/:id", updateTransaction)
router.delete("/:id", deleteTransaction)

module.exports = router