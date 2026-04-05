const express = require('express');
const eventController = require('../controllers/event.controller');
const { requireAuth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

const router = express.Router();

router.get('/', eventController.listApprovedEvents);
router.get('/mine', requireAuth, eventController.listMyEvents);
router.get('/registrations/me', requireAuth, eventController.listMyRegistrations);
router.get('/:eventId/participants', requireAuth, eventController.listEventParticipants);
router.post(
  '/',
  requireAuth,
  requireRole(['LECTURER', 'ADMIN', 'STUDENT']),
  eventController.createEvent,
);
router.post('/:eventId/register', requireAuth, requireRole(['STUDENT']), eventController.registerForEvent);
router.patch('/:eventId/cancel-registration', requireAuth, requireRole(['STUDENT']), eventController.cancelRegistration);

module.exports = router;
