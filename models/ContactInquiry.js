import mongoose from 'mongoose';

const contactInquirySchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true },
    phone:   { type: String, trim: true, default: '' },
    subject: { type: String, default: 'General Inquiry' },
    message: { type: String, required: true, trim: true },
    read:    { type: Boolean, default: false },  // mark as read in admin
  },
  { timestamps: true }  // createdAt, updatedAt auto-added
);

const ContactInquiry =
  mongoose.models.ContactInquiry ||
  mongoose.model('ContactInquiry', contactInquirySchema);

export default ContactInquiry;
