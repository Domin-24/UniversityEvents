const express = require('express');
const approvalController = require('../controllers/approval.controller');
const { requireAuth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

const router = express.Router();

router.use(requireAuth, requireRole(['LECTURER', 'ADMIN']));
router.get('/pending', approvalController.listPendingEvents);
router.patch('/:eventId', approvalController.reviewEvent);

module.exports = router;
