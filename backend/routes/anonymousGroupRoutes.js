// routes/anonymousGroupRoutes.js
const authMiddleware = require('../middleware/authMiddleware');


// Change 'import' to 'const ... = require(...)'
const express = require('express');
const {
    createGroup,
    getAllGroups,
    deleteGroup,
    sendGroupMessage,
    getGroupById,
    leaveGroup
} = require('../controllers/anonymousGroupController.js');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
    .get(getAllGroups)
    .post(createGroup);
    
router.post('/message', sendGroupMessage);

router.post('/:id/leave', leaveGroup);

router.route('/:id')
    .get(getGroupById)     // ✅ Add this line
    .delete(deleteGroup);


// Change 'export default' to 'module.exports'
module.exports = router;