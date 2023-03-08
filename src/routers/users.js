const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.json({ answer: "ok" })
})

module.exports = router