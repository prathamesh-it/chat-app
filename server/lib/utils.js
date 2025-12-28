import jwt from "jsonwebtoken";

//Function to generate a token for a user
export const generateToken = (userId)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET);
    return token;
}

// “Server एक token बनवतो
// ज्यामध्ये userId आहे
// आणि तो token JWT_SECRET ने sign (lock) केलेला आहे.”

// JWT_SECRET = server चा secret password
// हा secret फक्त server ला माहित असतो
// Token verify करण्यासाठी वा
