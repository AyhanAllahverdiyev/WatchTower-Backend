const User = require("../models/User");
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const mg=require('mailgun-js');
 
const mailgun=()=>mg(
    {
        apiKey:process.env.API_KEY,
        domain:process.env.DOMAIN
    }
)
const secretString = process.env.secret;
 const sendCodeToEmail = async (req, res) => {
    const {to,subject,message}=req.body;
    emailInfo={
        from:'"WatchTowerSandBox" <WatchTowerApp@yahoo.com>',
        to : to,
        subject :  subject,
        text : message
    }
    mailgun().messages().send(emailInfo,(err,body)=>{
        if(err){
            console.log(err);
            res.status(500).send({message:'Something went Wrong'});
        }
        else{
            res.send({message:'Email Sent With Code'});
        }
    })
console.log(emailInfo);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 
const updatePassword = async (req, res) => {
    const { email, password, newPassword } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send("Invalid password");
        }

        // If password is valid, update the password (bypassing the pre middleware)
        user.password = newPassword;
        await user.save();

        res.send("User Details Updated");
    } catch (error) {
        res.status(500).send("Error updating password");
    }
};


const newPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Check if the new password is the same as the previous one
        const isSameAsPrevious = await bcrypt.compare(newPassword, user.password);

        if (isSameAsPrevious) {
            return res.status(400).send("New password must be different from the previous one");
        }

        // Update the password (bypassing the pre middleware)
        user.password = newPassword;
        await user.save();

        res.send("New password Set");
    } catch (error) {
        res.status(500).send("Error updating password");
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 



module.exports = {
    updatePassword,
    newPassword,
    sendCodeToEmail
 };
