var express = require('express');
var router = express.Router();

router.post('/authenticate', (req, res, next) => {
    const { email, password, rememberMe } = req.body;
    console.log(`${email} ${password} ${rememberMe}`);
    res.json({ success: true }).status(200);
});

module.exports = router;
