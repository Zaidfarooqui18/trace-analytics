import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    session_id: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    event_type: {
      type: String,
      required: true,
      enum: ['page_view', 'click', 'custom'],
      index: true,
    },
    page_url: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    page_path: {
      type: String,
      default: '/',
      trim: true,
    },
    page_title: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    received_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Click coordinates
    x: { type: Number },
    y: { type: Number },
    page_x: { type: Number },
    page_y: { type: Number },
    scroll_x: { type: Number },
    scroll_y: { type: Number },
    normalized_x: { type: Number, min: 0, max: 1 },
    normalized_y: { type: Number, min: 0, max: 1 },
    is_rage_click: { type: Boolean, default: false },

    // Dimensions
    viewport_width: { type: Number },
    viewport_height: { type: Number },
    document_width: { type: Number },
    document_height: { type: Number },

    // Target element metadata
    target: {
      tag: { type: String, default: '' },
      id: { type: String, default: '' },
      class: { type: String, default: '' },
      text: { type: String, default: '' },
      selector: { type: String, default: '' },
    },

    // Device metadata
    device: {
      type: { type: String, default: 'desktop' }, // 'desktop', 'mobile', 'tablet'
      browser: { type: String, default: 'Other' },
      os: { type: String, default: 'Other' },
    },

    referrer: { type: String, default: '' },
    user_agent: { type: String, default: '' },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound indexes for optimal query execution
EventSchema.index({ session_id: 1, timestamp: 1 });
EventSchema.index({ page_url: 1, event_type: 1 });
EventSchema.index({ timestamp: -1 });
EventSchema.index({ session_id: 1, event_type: 1 });

export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
