import mongoose from "mongoose";
const ratingSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  menteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentee',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});
// Automatically update `updatedAt` on save
ratingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();

});
// Ensures a mentee can submit only one review per mentor
ratingSchema.index({ mentorId: 1, menteeId: 1 }, { unique: true });
export const Rating = mongoose.model('Rating', ratingSchema);
