import mongoose, { Schema, Document, Model } from "mongoose";

interface IQuestion {
  id: string;
  text: string;
  order: number;
  active: boolean;
}

export interface IEvaluationForm extends Document {
  form_id: string;
  title: string;
  active: boolean;
  scale: { min: number; max: number };
  deadline: Date | null;
  questions: IQuestion[];
}

const QuestionSchema = new Schema<IQuestion>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    order: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { _id: false }
);

const EvaluationFormSchema = new Schema<IEvaluationForm>(
  {
    form_id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    active: { type: Boolean, default: false },
    scale: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 5 },
    },
    deadline: { type: Date, default: null },
    questions: { type: [QuestionSchema], default: [] },
  },
  { timestamps: false }
);

const EvaluationFormModel: Model<IEvaluationForm> =
  mongoose.models.EvaluationForm ||
  mongoose.model<IEvaluationForm>("EvaluationForm", EvaluationFormSchema);

export default EvaluationFormModel;
