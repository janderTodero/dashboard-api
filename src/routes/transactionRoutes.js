const express = require('express')
const { create, getAllTransactions, readTransaction, updateTransaction, deleteTransaction, importTransactions } = require('../controllers/transactionController')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

router.use(authMiddleware)

router.post("/", create)
router.post("/import", (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: "Upload error: " + err.message, code: err.code })
        } else if (err) {
            return res.status(500).json({ message: "Unknown upload error: " + err.message })
        }
        next()
    })
}, importTransactions)
router.get("/", getAllTransactions)
router.get("/:id", readTransaction)
router.put("/:id", updateTransaction)
router.delete("/:id", deleteTransaction)

module.exports = router