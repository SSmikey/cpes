import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvaluation extends Document {
  evaluation_id: string;
  form_id: string;
  student_id: string;
  project_id: string;
  answers: Map<string, number>;
  submitted_at: Date;
}

const EvaluationSchema = new Schema<IEvaluation>(
  {
    evaluation_id: { type: String, required: true, unique: true },
    form_id: { type: String, required: true },
    student_id: { type: String, required: true },
    project_id: { type: String, required: true },
    answers: { type: Map, of: Number, required: true },
    submitted_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Compound index to prevent duplicate evaluations
EvaluationSchema.index({ student_id: 1, project_id: 1, form_id: 1 }, { unique: true });

const EvaluationModel: Model<IEvaluation> =
  mongoose.models.Evaluation ||
  mongoose.model<IEvaluation>("Evaluation", EvaluationSchema);

export default EvaluationModel;
