const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  requirements: String,
  applicationInstructions: String,
  companyName: String,
  location: String,
  salaryRange: String,
  employmentType: String,
  industry: String,
  companyDescription: String,
  contactEmail: String,
  contactPhone: String,
  applicationDeadline: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
