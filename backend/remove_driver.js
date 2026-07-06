const mongoose = require('mongoose');

async function removeDriver() {
  await mongoose.connect('mongodb://localhost:27017/movex');
  const db = mongoose.connection;
  
  const result = await db.collection('users').deleteOne({ phone: '1212121212', role: 'driver' });
  console.log(`Deleted ${result.deletedCount} driver(s)`);
  
  await mongoose.disconnect();
}

removeDriver().catch(console.error);
