import { deleteResourceByPublicId } from "../helpers/cloudinary.js";
import User from "../models/User.js";

const fn = async (id) => {
  try {
    const deleteResult = await deleteResourceByPublicId(id);

    // If the resource was deleted, update public_id to true
    if (deleteResult.status === 200) {
      return {
        public_id: true, // Mark public_id as true after successful deletion
        delete_message: deleteResult.message,
      };
    } else {
      // If deletion failed, mark public_id as false and add delete_message
      return {
        public_id: false, // Mark public_id as false if deletion fails
        delete_message: deleteResult.message || "Deletion failed",
      };
    }
  } catch (err) {
    // If an error occurs, mark public_id as false and add error message
    return {
      ...item,
      public_id: false,
      delete_message: err.message || "Error during deletion",
    };
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  const { id } = req.body;
  console.log(id);
  try {
    const data = await fn(id);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
