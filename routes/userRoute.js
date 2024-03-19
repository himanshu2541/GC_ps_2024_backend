const express = require('express');
const { updateUser, deleteUser, loginUser, registerUser, userProfile } = require('../controllers/userControllers');
const {protect} = require('../middlewares/authMiddleware')
const router = express.Router();

router.route('/login').post(loginUser)
router.route('/register').post(registerUser)
router.route('/').patch(protect, updateUser).delete(protect, deleteUser).get(protect, userProfile)

module.exports = router;