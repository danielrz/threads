import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true},
  username: { type: String, required: true, unique: true},
  name: { type: String, required: true},
  image: String,
  bio: String,
  threads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Thread" }], //one to many
  onboarded: { type: Boolean, default: false },
  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }], //many to many
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
// if the model does not exist it is created based on the schema, otherwise it is retrieved

export default User;