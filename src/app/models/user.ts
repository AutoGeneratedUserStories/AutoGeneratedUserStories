import {
  getModelForClass,
  index,
  ModelOptions,
  mongoose,
  post,
  Severity,
} from "@typegoose/typegoose";
import { prop } from "@typegoose/typegoose/lib/prop";
import { Project } from "./project";
 
@post<User>("save", function (doc) {
  if (doc) {
    doc.id = doc._id.toString();
    doc._id = doc.id;
  }
})
@post<User[]>(/^find/, function (docs) {
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
    collection: "users",
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
@index({ username: 1 })
class User {
  @prop({ required: true})
  password: string;

  @prop({ required: true, unique: true })
  username: string;

  @prop({ required: false, type: () => [Project], _id: false, default: [] })
  projects?: Project[];
  
  _id: mongoose.Types.ObjectId | string;
  id: string;
}
 
const UserModel = mongoose.models.User || getModelForClass(User);
export { UserModel, User };
