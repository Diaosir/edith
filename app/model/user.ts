export default app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const userSchema = new Schema({
    mobile: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },

});
return mongoose.model('User', userSchema);
}