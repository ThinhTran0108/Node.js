const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const infoSchema = new Schema({
  companyId: {type: String, required: true},
  name: {type: String, required: true},
  role: {type: String, required: true},
  doB: {type: Date, required: true},
  salaryScale: {type: Number, required: true},
  startDate: {type: Date, required: true},
  department: {type: String, required: true}, 
  annualLeave: {type: Number, required: true},
  imageUrl: {type: String, required: true},
  status: {type: String, required: true},
  userAdmin: {
    _id: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    username: {type: String}
  }
});

module.exports = mongoose.model('Info', infoSchema);
