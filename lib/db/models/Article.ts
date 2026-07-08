import mongoose, { Schema, type Document } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug?: string;
  author: string;
  content: string;
  category: string;
  summary: string;
  heroImage?: string;
  tags: string[];
  views: number;
  wordCount: number;
  status: "draft" | "submitted" | "published" | "rejected";
  submittedDate?: Date;
  publishedDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    author: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    heroImage: String,
    tags: [String],
    views: { type: Number, default: 0, min: 0 },
    wordCount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["draft", "submitted", "published", "rejected"],
      default: "draft",
      index: true,
    },
    submittedDate: Date,
    publishedDate: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

ArticleSchema.index({ status: 1, createdAt: -1 });

export const Article =
  mongoose.models.Article ?? mongoose.model<IArticle>("Article", ArticleSchema);
