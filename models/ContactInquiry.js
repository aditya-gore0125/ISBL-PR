import mongoose from 'mongoose';

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, default: '', trim: true, maxlength: 30 },
    subject: { type: String, default: 'General Inquiry', trim: true, maxlength: 100 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ContactInquiry = mongoose.models.ContactInquiry
  || mongoose.model('ContactInquiry', contactInquirySchema);

export default ContactInquiry;
