const { MongoClient } = require("mongodb");

const oldDbName = "turkey";
const newDbName = "england";
const uri =
  "mongodb+srv://tufanozkan:TheOZKAN1905@cluster0.c9sgw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // MongoDB bağlantı adresin

async function renameDatabase() {
  const client = new MongoClient(uri);
  await client.connect();

  const oldDb = client.db(oldDbName);
  const newDb = client.db(newDbName);

  const collections = await oldDb.listCollections().toArray();

  for (let collection of collections) {
    const oldCollection = oldDb.collection(collection.name);
    const newCollection = newDb.collection(collection.name);

    const docs = await oldCollection.find().toArray();
    if (docs.length > 0) {
      await newCollection.insertMany(docs);
    }
  }

  console.log(`"${oldDbName}" veritabanı "${newDbName}" olarak kopyalandı.`);

  // Eski veritabanını silmek için yorum satırını kaldır
  // await oldDb.dropDatabase();

  await client.close();
}

renameDatabase();
