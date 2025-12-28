import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

//React gives you a way to create a global data pipe.
export const ChatContext = createContext();

//children = whatever components you wrap inside <ChatProvider>
export const ChatProvider = ({children})=>{
    
    const [messages , setMessages] = useState([]);
    const [users , setUsers] = useState([]);
    const [selectedUser , setSelectedUser] = useState(null);  //we store id of ths user whom we want to chat
    const [unseenMessages, setUnseenMessages] = useState({}); //no of msg unseen and user id

    const {socket , axios} = useContext(AuthContext);
    
    //function to get all users for sidebar

    const getUsers = async()=>{
        try {
            const {data} = await axios.get("/api/messages/users");
            if(data.success)
            {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Function to get messages for selected user

    const getMessages = async()=>{
        try {
            const {data} = await axios.get(`/api/messages/${selectedUser._id}`);
            if(data.success)
            {
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //Function to send Message to selected user

    const sendMessage = async(messageData)=>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}` , messageData);
            if(data.success)
            {
                setMessages((prevMessages)=>[...prevMessages , data.newMessage])//new message we created in backend
            }
            else
            {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to subscribe to message for selected user
    const subscribleToMessages = async()=>{
        if(!socket) return;

        socket.on("newMessage" , (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=>[...prevMessages , newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }
            else
            {
                //It will return the object
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages , 
                    [newMessage.senderId]:prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    //function to unsubscribe from messages

    const unsubscribleFromMessages = ()=>{
        if(socket) socket.off("newMessage");
    }

    useEffect(()=>{
        subscribleToMessages();
        return ()=> unsubscribleFromMessages();
    },[socket , selectedUser])


    const value = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        setUnseenMessages
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}