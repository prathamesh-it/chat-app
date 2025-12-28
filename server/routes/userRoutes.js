import express from 'express';
import { checkAuth, login, signup, updateProfile } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

//Signup page request
userRouter.post("/signup" , signup);

//Login page request
userRouter.post("/login" , login);

//update page request
userRouter.put("/update-profile" , protectRoute , updateProfile);

//Check the user is authenticated or not
userRouter.get("/check" , protectRoute , checkAuth);

export default userRouter;