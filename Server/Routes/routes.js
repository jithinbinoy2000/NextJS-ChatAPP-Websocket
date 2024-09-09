const express = require('express');
const { loginUser, registerUser } =require('../Controllers/usercontroller')
const router = express.Router();

router.get('/', (request, response) => {
  response.status(200).json({ message: "Server Running SuccessFully" });
});

router.post('/login', loginUser);
router.post('/register',registerUser);

module.exports = router;