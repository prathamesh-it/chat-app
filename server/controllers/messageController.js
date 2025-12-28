import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io,userSocketMap } from "../server.js";

//Get all logged in user and the unseen messages
//Each user unseen message get count 

// Frontend ला मिळतं:
// Sidebar users list
// Each user चा unseen count

export const getUsersForSidebar = async(req , res)=>{
    // list of user and no of unread msg
    try {
        const userId = req.user._id;  //receiver
        const filteredUsers = await User.find({_id: {$ne : userId}}).select("-password");  //$ne = not equal

        //count no of unseen messages
        // key = senderId
        //value = unseen message count
        const unseenMessages = {}
        const promises = filteredUsers.map(async(user) =>{
            //all unseen messages in the message variable
            const messages = await Message.find({senderId : user._id , receiverId : userId , seen: false})
            if(messages.length > 0)
            {
                //no of unseen msg for that sender
                unseenMessages[user._id] = messages.length;
            }
            
        })
        //execute promises
        await Promise.all(promises);
        res.json({success : true, users : filteredUsers , unseenMessages})
    } catch (error) {
        console.log(error.message);
        res.json({success : false, message : error.message})
    }
}
// senderId = sidebar user
// receiverId = logged-in user
// seen = false



//Get all messages for selected user
export const getMessages = async(req , res)=>{
    try {
        const { id : selectedUserId} = req.params; //get id and store in selectedUser id,chat उघडलेला user
        const myId = req.user._id; //logged in user 

        const messages = await Message.find({
            $or : [
                {senderId : myId , receiverId : selectedUserId},
                {senderId : selectedUserId , receiverId : myId},
            ]
        })
        
        //Messages mark as seen
        await Message.updateMany({senderId : selectedUserId, receiverId : myId}, {seen : true});

        res.json({success : true , messages})

    } catch (error) {
        console.log(error.message);
        res.json({success : false, message : error.message})
    }
}


//Function to mark messages as seen using message id

export const markMessageAsSeen = async(req , res)=>
{
    try {
        const {id} = req.params;
        await Message.findByIdAndUpdate(id, {seen : true});

        res.json({success:true});
    } catch (error) {
        console.log(error.message);
        res.json({success : false, message : error.message})
    }
}

//Send message to selected User
export const sendMessage = async(req , res)=>{
    try {
        const {text , image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;  //using middleware

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image : imageUrl
        })

        //Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId)
        {
            io.to(receiverSocketId).emit("newMessage" , newMessage);
        }

        res.json({success : true , newMessage});

    } catch (error) {
        console.log(error.message);
        res.json({success : false, message : error.message})
    }
}