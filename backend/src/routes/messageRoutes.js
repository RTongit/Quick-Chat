import express from 'express'
import protectRoute from '../middleware/protectRoute.js'
import { getMessages, getUsersForSidebar, sendMessage } from '../controller/messagecontroller.js'
const router = express.Router()

router.get('/users',protectRoute,getUsersForSidebar)
// This will displays all messages between two chatters
router.get('/chatlog/:id',protectRoute,getMessages)
router.post('/sendMessage/:id',protectRoute,sendMessage)

export default router