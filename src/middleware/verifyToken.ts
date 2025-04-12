import jwt from "jsonwebtoken"
import config from "../config/config";


export const verifyToken = (req: any, res: any, next: any) => {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    try {
        const decoded = jwt.verify(token, config.jwtSecret as jwt.Secret);

        if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });

        req.user = decoded;
        next();
    } catch (error) {
        console.log("Error in verifyToken ", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};