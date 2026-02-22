import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  id: string;
  name: string;
}

const ProjectSchema = new Schema<IProject>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: false }
);

const ProjectModel: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default ProjectModel;
