export default app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const projectSchema = new Schema({
    createTime: {
      type: String,
      required: true,
    },
    updateTime: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    auchor: {
      type: String,
      required: true,
    },
    componentName: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    docs: {
      type: String,
      required: true,
    },
    groups: {
      type: String,
      required: true,
    },
    contributors: {
      type: String,
      required: true,
    },
    loadTimes: {
      type: String,
      required: true,
    },
  });
  return mongoose.model('Project', projectSchema);
}