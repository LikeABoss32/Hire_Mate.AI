/*import User from "../models/user.model.js"


export const getCurrentUser = async (req,res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({message:"user does not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
         return res.status(500).json({message:`failed to get currentUser ${error}`})
    }
}*/
import User from "../models/user.model.js"

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    // ✅ FIX: if not logged in
    if (!userId) {
      return res.status(200).json(null);
    }

    const user = await User.findById(userId);

    // ✅ FIX: user not found
    if (!user) {
      return res.status(200).json(null);
    }

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({
      message: `failed to get currentUser ${error}`
    });
  }
};
