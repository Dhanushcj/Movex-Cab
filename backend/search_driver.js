const mongoose = require('mongoose');

async function listAllUsers() {
  await mongoose.connect('mongodb://localhost:27017/movex');
  const db = mongoose.connection;
  
  const users = await db.collection('users').find({}).toArray();
  console.log('All Users Phones:');
  users.forEach(u => console.log(`- Phone: ${u.phone} (${typeof u.phone}), Role: ${u.role}`));
  
  await mongoose.disconnect();
}

listAllUsers().catch(console.error);
