import mongoose from "mongoose";
import { Story } from "./story";
import { getModelForClass, index, ModelOptions, post, prop, Severity } from "@typegoose/typegoose";

@post<Project>("save", function (doc) {
  if (doc) {
    doc.id = doc._id.toString();
    doc._id = doc.id;
  }
})
@post<Project[]>(/^find/, function (docs) {
  // @ts-expect-error ignore
  if (this.op === "find") {
    docs.forEach((doc) => {
      doc.id = doc._id.toString();
      doc._id = doc.id;
    });
  }
})
@ModelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "projects",
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
@index({ title: 1 })
class Project {
  @prop({ required: true, type: () => [Story] })
  stories: Story[];

  @prop({ required: false })
  description: string;

  @prop({ required: true })
  name: string;

  _id: mongoose.Types.ObjectId | string;

  id: string;
}

// If we hot reload, it already exists
const ProjectModel = mongoose.models.Project || getModelForClass(Project);
export { ProjectModel, Project };
