const { login, signup } = require("../controller/authController")

const router = require("express").Router()
const userModel = require('../model/userModel');

router.post("/signup",signup)
router.post("/login",login)

router.get('/check-user/:id', async (req, res) => {
    try {
      const user = await userModel.findById(req.params.id);
      res.json({ 
        exists: !!user,
        user: user || null
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router