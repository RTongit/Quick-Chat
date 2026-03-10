import cloudinary from '../lib/cloudinary.js'
import generateToken from '../lib/utils.js'
import User from '../models/userModel.js'
import bcrypt from 'bcryptjs'

export async function signup(req,res){
    let {fullName,email,password} = req.body
    try{
        if(!fullName || !email || !password) {
            return res.status(400).json({message:"All Fields are required"})   
        }
        if(password.length<6) {
            return res.status(400).json({message:"Password must be atleast 6 characters long"})
        }

        // Check existing user
        const existingUser = await User.findOne({email:email})
        if (existingUser) return res.status(400).json({message : "Email already exists"})
        
        // Generating the hashed password :      
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt)

        //Here new User(...) creates a DB document instance(newUser)
        const newUser = new User({
            fullName : fullName,
            email : email,
            password : hashedPassword
        }) 

        // Saving the document(i.e newUser) to database 
        await newUser.save()

        //Generate awt token
        generateToken(newUser._id,res)

        // Sending the response 
        return res.status(201).json({
            _id: newUser._id,
            fullName : newUser.fullName,
            email : newUser.email,
            profilePic : newUser.profilePic
        })

    }
    catch(error) {
        console.log(`Error in signup controller : ${error.message}`)
        return res.status(500).json({message : "Internal Server Error"})
    }
    
}

export async function login(req,res){
    const {email,password} = req.body
    try{

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({email:email});
        if(!user) {
            return res.status(400).json({message : "Invalid Credentials"});
        }
        // Here isPasswordCorrect is a boolean value
        // password is the user provided password
        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect) {
            return res.status(400).json({message : "Invalid Credentials"});
        }
        generateToken(user._id,res)
        return res.status(200).json({
            _id: user._id,
            fullName : user.fullName,
            email : user.email,
            profilePic : user.profilePic,
            createdAt : user.createdAt
        })
    }
    catch(error){
        console.log(`Error in login controller : ${error.message}`)
        return res.status(500).json({message : "Internal Server Error"})
    }
}

export async function logout(req,res){
    try{
        res.clearCookie('jwt',
        {
            httpOnly : true,            
            sameSite : "strict",     
            secure : process.env.NODE_ENV === "production" ? true : false
        }
        );

        return res.status(200).json({message : "You have logged out successfully"})
    }
    catch(error) {
        console.log(`Error in logout controller : ${error.message}`)
        return res.status(500).json({message : "Internal Server Error"})
    }
}

export async function updateProfile(req,res) {
    try{
        const {profilePic} = req.body;
        // Bad request from client
        if(!profilePic) {
            return res.status(400).json({message : "Profile pic is required"});
        }
        const userId =req.user._id;

        // uploadResponse is an obj with secure_url as one of its property 
        // cloudinary.uploader.upload() accepts only a string as parameter
        // Cloudinary stores the image on its servers (cloud storage)
        // Cloudinary generates a public URL,that is secure_url  
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        // update the document in DB 
        await User.updateOne({_id:userId},
            {$set : {profilePic : uploadResponse.secure_url}}
        )
        // Fetch the updated document from DB
        const updatedUser = await User.findOne({_id : userId});

        return res.status(200).json(updatedUser);

    }
    catch(error) {
        console.log(`Error in update profile ${error.message}`)
        return res.status(500).json({message : "Internal Server Error"})
    }
}

export function checkAuth(req,res) {
    try{
        return res.status(200).json(req.user)
    }
    catch(error) {
        console.log(`Error in checkAuth controller ${error.message}`)
        return res.status(500).json({message : "Internal Server Error"});
    }
}
