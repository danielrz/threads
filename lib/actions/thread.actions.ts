'use server'

import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model"
import User from "../models/user.model"
import { revalidatePath } from "next/cache"

interface Params {
  text: string
  author: string
  communityId: string | null
  path: string
}

export async function createThread({text, author, communityId, path}: Params) {
  try {
    connectToDB()

    const createdThread = await Thread.create({text, author, community: null})

    //update user table with created thread id
    await User.findByIdAndUpdate(author, {$push: {threads: createdThread._id}})

    // make sure the changes are happening immediatly on the nextjs website
    revalidatePath(path)
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`)
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB()

    // calculate the number of posts to skip depending on the page number
    const skipAmount = pageSize * (pageNumber - 1)
    
    // fetch the posts that have no parent (top level posts)
    const postsQuery = Thread
      .find({parentId: {$in: [null, undefined]}})
      .sort({createdAt: 'desc'})
      .skip(skipAmount)
      .limit(pageSize)
      .populate({path: 'author', model: User})
      .populate({
        path: 'children',
        populate: {
          path: 'author',
          model: User,
          select: '_id name parentId image'
        }
      })

    const totalPosts = await Thread.countDocuments({parentId: {$in: [null, undefined]}})

    const posts = await postsQuery.exec()

    const isNext = totalPosts > pageNumber * pageSize

    return {posts, isNext}
  } catch (error: any) {
    throw new Error(`Failed to fetch posts: ${error.message}`)
  }
}

export async function fetchThreadById(id: string) {
  connectToDB()

  try {
    // TODO: populate community
    const thread = await Thread.findById(id)
      .populate({path: 'author', model: User, select: '_id name name image'})
      .populate({
        path: 'children', // comments
        populate: [
          { 
            path: 'author',// the author of the comment
            model: User,
            select: '_id name parentId image'
          },
          {
            path: 'children', // recursive replies of the comment
            model: Thread,
            populate: {
              path: 'author',
              model: User,
              select: '_id name parentId image'
            }
          }
        ]
      })
      .exec()

    return thread
  } catch (error: any) {
    throw new Error(`Failed to fetch thread ${id}: ${error.message}`)
  }
}

interface CommentParams {
  threadId: string
  commentText: string
  userId: string
  path: string
}

export async function  addCommentToThread({
  threadId, commentText, userId, path
}: CommentParams) {
  try {
    connectToDB()
    // find the original thread by its id
    const originalThread = await Thread.findById(threadId)
    if (!originalThread) {
      throw new Error('Thread not found')
    }
    //create a new thread with the comment text
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId
    })
    // save the new thread
    const savedCommentThread = await commentThread.save()
    //update the original thread with the new comment
    originalThread.children.push(savedCommentThread._id)
    //save the original thread
    await originalThread.save()
    revalidatePath(path)

  } catch (error: any) {
    throw new Error(`Failed to add comment to thread: ${error.message}`)
  }
}