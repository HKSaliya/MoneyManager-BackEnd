import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import multer from 'multer';
import nc from 'next-connect';
import { getSession } from 'next-auth/react';

// Set up Multer storage for avatar upload
const upload = multer({ storage: multer.memoryStorage() });

const handler = nc()
    .use(upload.single('avatar'))
    .put(async (req, res) => {
        await dbConnect();

        const session = await getSession({ req });
        if (!session) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const user = await User.findOne({ email: session.user.email });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Extract fields from request body
            const { firstName, lastName, gender, dateOfBirth, country, language } = req.body;

            // Update user details
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.gender = gender || user.gender;
            user.dateOfBirth = dateOfBirth || user.dateOfBirth;
            user.country = country || user.country;
            user.language = language || user.language;

            // Handle avatar upload (if provided)
            if (req.file) {
                const avatarUrl = `https://your-storage-url.com/${req.file.originalname}`; // Replace with actual upload logic
                user.avatar = avatarUrl;
            }

            await user.save();
            return res.status(200).json({ message: "Profile updated successfully", user });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error" });
        }
    });

export const config = {
    api: {
        bodyParser: false, // Needed for Multer to work
    },
};

export default handler;
