// routes/anonymousGroupRoutes.js

// Change 'import' to 'const ... = require(...)'
const express = require('express');
const {
    createGroup,
    getAllGroups,
    deleteGroup
} = require('../controllers/anonymousGroupController.js');

const router = express.Router();

router.route('/')
    .get(getAllGroups)
    .post(createGroup);

router.route('/:id')
    .delete(deleteGroup);

// Change 'export default' to 'module.exports'
module.exports = router;