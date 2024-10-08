
import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) =>{
    const accessToken = jwt.sign({userId},process.env.ACCESS_TOKEN_SECRET,{
expiresIn:'15m',
    })
    const refreshToken = jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:'7d',
    })

    return{accessToken,refreshToken}
}

const storeRefeshToken = async (userId,refreshToken) =>{
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*24*60*60);//7day
}

const setCookies = (res, accessToken, refreshToken) => {
    console.log("Setting cookies:", { accessToken, refreshToken }); // Debug log
  
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
  
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  };
  

export const signup = async (req,res) =>{

    const {email,password,name} = req.body
    try {
        const userExists = await User.findOne({email});

    if (userExists){
        return res.status(400).json({message:"User already exists"})
    }
    const user = await User.create({name,email,password})

//authentication
 const {accessToken,refreshToken}  = generateToken(user._id);
 await storeRefeshToken(user._id,refreshToken);
 setCookies(res,accessToken,refreshToken);

    res.status(201).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role
    });
} catch (error) {
    console.log("Error in signup controller",error.message)
        res.status(500).json({message:error.message})
    }
    
};

export const login = async (req,res) =>{
   try {
    const {email,password} = req.body
    const user = await User.findOne({email})

    if (user && (await user.comparePassword(password))){
       const {accessToken,refreshToken} = generateToken(user._id)
       await storeRefeshToken(user._id,refreshToken)
       setCookies(res,accessToken,refreshToken)
       res.json({
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role
       })
    }else{
        res.status(401).json({message:"Invalid email or password"})
    }
   } catch (error) {
    console.log("Error in login controller",error.message)
    res.status(500).json({message:error.message})
    
   }
}

export const logout = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
  
      if (!refreshToken) {
        return res.status(400).json({ message: "No refresh token provided" });
      }
  
      // Verify and decode the refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  
      console.log("Decoded JWT:", decoded); // Add this for debugging purposes
  
      // Ensure `decoded` contains userId, then proceed to delete from Redis
      if (decoded && decoded.userId) {
        await redis.del(`refresh_token:${decoded.userId}`);
        console.log(`Refresh token deleted for userId: ${decoded.userId}`);
      } else {
        return res.status(400).json({ message: "Invalid token structure" });
      }
  
      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
  
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error during logout:", error); // Log any errors for further analysis
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  //this will refresh the access token

  export const refreshToken = async (req,res)=>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({message:"No refresh token provided"})
        }
        const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`)
        
        if(storedToken !== refreshToken){
            return res.status(401).json({message:"Invalid refresh token"})
        }
        const accessToken = jwt.sign({userId:decoded.userId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'15m'});
         res.cookie('accessToken',accessToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:"strict",
            maxAge:15*60*1000,
         })
         res.json({message:"Token refreshed successfully"})
    } catch (error) {
        console.log("Error in refresh token controller",error.message)
        res.status(500).json({message:"Server error",error:error.message})
    }
  }

  //profile--impplement get profile later
//   export const getProfile = async (req,res) =>{}