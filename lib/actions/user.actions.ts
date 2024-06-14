"use server";

import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path}: Params
): Promise<void> {
  
  try {
    connectToDB();
    await User.findOneAndUpdate(
      { id: userId }, //find a document with id
      { username: username.toLowerCase(), name, bio, image, onboarded: true }, // document to update
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string): Promise<any> {
  try {
    connectToDB();
    const user = await User.findOne({ id: userId })
      // .populate({path: 'communities', model: Community}); //we will populate when we have this model
    return user;
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}


