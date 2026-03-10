import jwt from 'jsonwebtoken'

export default function generateToken(userId,res) {
    // Creating a token(which is a string of format HEADER.PAYLOAD.SIGNATURE)
    const token = jwt.sign(
       { userId: userId },
        process.env.JWT_SECRET,
        {expiresIn:'7d'}
    )
    
    res.cookie('jwt',token,
        {
            maxAge:7*24*60*60*1000,  // milliseconds
            httpOnly : true,         // Cookie cannot be accessed by JavaScript.
                                     // Prevents XSS attacks
            sameSite : "strict",     // Cookie is sent only from same site
            secure : process.env.NODE_ENV === "production" ? true : false
            //process.env.NODE_ENV is an environment variable that tells your 
            // application what environment it's running in.
            // In development → HTTP allowed
            // In production → HTTPS only
        }
    )
    return token;
}