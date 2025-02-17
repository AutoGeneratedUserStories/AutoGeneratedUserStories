import {
  getModelForClass,
  index,
  ModelOptions,
  mongoose,
  post,
  Severity,
} from "@typegoose/typegoose";
import { prop } from "@typegoose/typegoose/lib/prop";

@post<Story>("save", function (doc) {
  if (doc) {
    doc.id = doc._id.toString();
    doc._id = doc.id;
  }
})
@post<Story[]>(/^find/, function (docs) {
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
class Story {
  @prop({ required: true, default: [] })
  public acceptanceCriteria?: string[];

  @prop()
  public description: string;

  @prop({ required: true })
  public name: string;

  _id: mongoose.Types.ObjectId | string;

  id: string;
}

const StoryModel = mongoose.models.Story || getModelForClass(Story);
export { StoryModel, Story };
