import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  student_id: string;
  name: string;
  year: number;
  own_group: string;
  evaluated_projects: string[];
  created_at: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    student_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    year: { type: Number, required: true },
    own_group: { type: String, required: true },
    evaluated_projects: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const StudentModel: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default StudentModel;
