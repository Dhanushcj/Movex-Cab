const mongoose = require('mongoose');
const uri = "mongodb://dhanushchakravarthy18_db_user:Dhanush123@ac-vcwz527-shard-00-00.4uwjxa0.mongodb.net:27017,ac-vcwz527-shard-00-01.4uwjxa0.mongodb.net:27017,ac-vcwz527-shard-00-02.4uwjxa0.mongodb.net:27017/movex?ssl=true&replicaSet=atlas-2r0qvt-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Movex";

mongoose.connect(uri).then(async () => {
  const Driver = mongoose.model('Driver', new mongoose.Schema({}, { strict: false }));
  
  const drivers = await Driver.find({ isOnline: true });
  console.log(`Found ${drivers.length} online drivers in production DB.`);
  
  for (let i = 0; i < drivers.length; i++) {
    const driver = drivers[i];
    
    // Spread them out slightly around Krishnagiri: [78.21 + offset, 12.52 + offset]
    const offsetLng = (i * 0.005); 
    const offsetLat = (i * 0.005);
    
    const newCoords = [78.21 + offsetLng, 12.52 + offsetLat];
    
    await Driver.updateOne(
      { _id: driver._id },
      { 
        $set: { 
          currentLocation: {
            type: 'Point',
            coordinates: newCoords
          },
          isAvailable: true,
          approvalStatus: 'approved'
        }
      }
    );
    console.log(`Updated ${driver.name || driver._id} to Krishnagiri coordinates: ${newCoords}`);
  }
  
  console.log('Done updating drivers in Production DB!');
  process.exit(0);
}).catch(console.error);
