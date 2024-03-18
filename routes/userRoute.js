const express = require('express');
const { updateUser, deleteUser, loginUser, registerUser, userProfile, getAllUsers } = require('../controllers/userControllers');
const {protect, adminAuthProtect} = require('../middlewares/authMiddleware')
const router = express.Router();

router.route('/login').get(loginUser)
router.route('/register').post(registerUser)
router.route('/:id').patch(protect, updateUser).delete(protect, deleteUser).get(protect, userProfile)
router.route('/admin/get-all-users').get(adminAuthProtect, getAllUsers)
module.exports = router;