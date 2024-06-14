import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, //one to many
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" }, //one to many
  createdAt: { type: Date, default: Date.now },
  parentId: { type: String },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Thread" }], // one thread can have multiple threads as children (recursive)
});

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);
// if the model does not exist it is created based on the schema, otherwise it is retrieved

export default Thread;