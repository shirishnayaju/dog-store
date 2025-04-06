import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";

async function createAdminAccount() {
    try {
        const existingAdmin = await User.findOne({ email: "ShirishNayaju@gmail.com" }); 
        if (!existingAdmin) {
            const newAdmin = new User({
                email: "ShirishNayaju@gmail.com",
                name: "Shirish",
                password: await bcryptjs.hash("adminshirish", 10),
                role: "admin"
            });
            await newAdmin.save();
            console.log("Admin Account created Successfully");
        } else {
            console.log("Admin already exists");
        }
    } catch (error) {
        console.error(error.message);
    }
}

export default createAdminAccount; 

