const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dataSchema = new Schema({
  companyId: {type: String, required: true},
  name: {type: String, required: true},
  salaryScale: {type: Number, required: true},
  annualLeave: {type: Number, required: true},
  timekeeping: [{
    date: {type: Date},
    monthOfYear: {type: String},
    workplace: {type: String},
    timeStart: {type: String},
    timeEnd: {type: String},
    workHours: {type: Number},
    leaveHours: {type: Number}
  }],
  bodyTemp: [{
    dateTemp: {type: Date},
    temp: {type: Number}
  }],
  vaccine: {
    dateVac_1: {type: Date},
    vac_1: {type: String},
    dateVac_2: {type: Date},
    vac_2: {type: String}
  },
  positive: [{
    datePositive: {type: Date},
    treatmentPlace: {type: String},
    treatmentTime: {type: Number}
  }],
  leave: [{
    startLeave:{type: Date},
    endLeave:{type: Date},
    leaveHours: {type: Number},
    reason: {type: String},
    remainingDays: {type: Number}
  }],
  timekeepingPerDay: [{
    date: {type: Date},
    monthOfYear: {type: String},
    workHoursPerDay: {type: Number},
    leaveHoursPerDay: {type: Number},
    overTime: {type: Number},
    underTime: {type: Number}
  }],
  salary: [{
    monthOfYear: {type: String},
    workHoursPerMonth: {type: Number},
    totalOverTime: {type: Number},
    totalUnderTime: {type: Number},
    salary: {type: Number}
  }],
  confirmedStatus: {type: Boolean, required: true},
  userAdmin: {
    _id: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    username: {type: String}
  }
});

module.exports = mongoose.model('Data', dataSchema);
