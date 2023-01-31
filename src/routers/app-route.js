const router = require("express").Router()

router.get("/", function (req, res) {
    res.render("home")
})

module.exports = router