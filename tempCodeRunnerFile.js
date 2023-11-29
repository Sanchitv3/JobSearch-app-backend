mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    mongoose.connection.db.createCollection('register', (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Collection "register" created');
        }
    });
});