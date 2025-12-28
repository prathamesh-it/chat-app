import express from 'express';
import { protectRoute } from '../middleware/auth.js';
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage } from '../controllers/messageController.js';

const messageRouter = express.Router();

//Users to display on sidebar
messageRouter.get("/users" , protectRoute , getUsersForSidebar);

//Messages for that id
messageRouter.get("/:id" , protectRoute , getMessages);

//Mark messages as seen
messageRouter.put("/mark/:id" , protectRoute , markMessageAsSeen);

//Send the message
messageRouter.post("/send/:id" , protectRoute , sendMessage);


export default messageRouter;