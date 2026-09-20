import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Run this with --env-file=.env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", UserSchema, "users");

async function run() {
  await mongoose.connect(MONGODB_URI);
  const result = await User.updateMany({ role: "rider" }, { $set: { role: "citizen" } });
  console.log(`Migrated ${result.modifiedCount} user(s) from "rider" to "citizen".`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});