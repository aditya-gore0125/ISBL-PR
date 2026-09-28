import connectToDatabase from '../lib/mongodb.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

async function syncIndexes() {
  const connection = await connectToDatabase();

  try {
    await Promise.all([
      User.syncIndexes(),
      Product.syncIndexes(),
      Category.syncIndexes(),
      Order.syncIndexes(),
    ]);
    console.log('MongoDB indexes synchronized for User, Product, Category, and Order.');
  } finally {
    await connection.close();
  }
}

syncIndexes().catch((error) => {
  console.error('MongoDB index synchronization failed.', error);
  process.exitCode = 1;
});