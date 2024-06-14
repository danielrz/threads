import mongoose from 'mongoose';

let isConnected: boolean = false;

export const connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URL) {
    console.error('MONGODB_URL not set');
    return;
  }

  if (isConnected) {
    console.log('=> using existing database connection');
    return;
  } 

  try {
    await mongoose.connect(process.env.MONGODB_URL)
    isConnected = true;
    console.log('connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB', error)
  }
}
    