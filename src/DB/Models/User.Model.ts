import { model, Model, Schema, Types } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Utils/Enums/User.Enum";
import { HydratedDocument } from "mongoose";
import { generateHash } from "../../Utils/Security/hash";
import { encrypt } from "../../Utils/Security/encryption";
import { emailEvents } from "../../Utils/events/email.events";
import { generateOtp } from "../../Utils/generateOtp";

export interface IUser {
  _id: Types.ObjectId;

  firstName: string;
  lastName: string;
  userName?: string;
  email: string;
  password: string;
  provider: ProviderEnum;
  confirmEmailOTP?: string;
  forgetPasswordOTP?: string;
  resetPasswordOTPExpiresAt?: Date;
  confirmedAt?: Date;
  profilePic?: string;
  phone?: string;
  address?: string;
  gender: GenderEnum;
  role: RoleEnum;
  createdAt: Date;
  updatedAt?: Date;
  changeCredentialsTime?: Date;
  friends?: Types.ObjectId[];
  BlockedUsers?: Types.ObjectId[];
}

export const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, minLength: 2, maxLength: 25 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    confirmEmailOTP: { type: String },
    forgetPasswordOTP: { type: String },
    resetPasswordOTPExpiresAt: { type: Date },
    confirmedAt: { type: Date },
    profilePic: { type: String },
    phone: { type: String },
    address: { type: String },

    changeCredentialsTime: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    BlockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.confirmEmailOTP;
        delete ret.forgetPasswordOTP;
        delete ret.resetPasswordOTPExpiresAt;
        return ret;
      },
    },
  },
);
/**
 * {
    "userName": "Adel Shakl",
    "email": "hossamjz22@gmail.com",
    "password": "adel1234",
    "confirmPassword":"adel1234"
   
}
 */

userSchema
  .virtual("userName") // "Hossam Jazeera"
  .set(function (value: string) {
    const [firstName, ...rest] = value.trim().split(/\s+/); // ...rest بتاخد باقي الاسم كله
    this.set({
      firstName,
      lastName: rest.join(" "), // join() بترجع النص
    });
  })
  .get(function (this: IUser) {
    return `${this.firstName} ${this.lastName ?? ""}`.trim();
  });

  // بيستخدم Mongoose Middleware

// userSchema.pre("save",function(){
//   console.log("pre save ", this);

// })
// pre document بتحصل قبل حفظ   this => document
//الـ Middleware دي بتشتغل قبل حفظ الـ Document في MongoDB.

// userSchema.post("save",function(doc,next){
//   console.log("post save",doc);
//   next()

// })
//post document بتحصل بعد حفظ   this => document

userSchema.pre("validate", function (this: HUserDocument) {
  this.email = this.email.toLowerCase().trim();
}); // قبل SAVE
// isNew; معناه document جديد true   false قديم 

// userSchema.pre("save", async function (this: HUserDocument &{wasNew:boolean}) {
//   this.wasNew = this.isNew;
//   if (this.isModified("password")) {
//     this.password = await generateHash(this.password);
//   }
//   if (this.isModified("phone")) {
//     this.phone = await encrypt(this.phone);
//   }
// });
/**
 * الفرق المهم:
- الـ Hash للـ Password: عملية اتجاه واحد، ومش بنرجّع الباسورد الأصلي منه.
- الـ Encryption للـ Phone: عملية قابلة لفك التشفير باستخدام المفتاح المناسب.
 */

// userSchema.post("save",async function (){
//   const that = this as HUserDocument &{wasNew:boolean}
//   if(that.wasNew) {
//     await emailEvents.emit("confirmEmail",{
//       otp:generateOtp(),
//       to:this.email,
//       userName: this.userName
//     })
//   }
// })

export const userModel: Model<IUser> = model<IUser>("User", userSchema);

export type HUserDocument = HydratedDocument<IUser>;

/**firstName = "Hossam"
rest = ["Jazeera"] */

/**
 * ده Type من Mongoose بيمثّل الـ Document بعد ما Mongoose يجهزه للتعامل مع قاعدة البيانات، وبيكون فيه بيانات المستخدم بالإضافة إلى وظائف Mongoose زي save()
 */


/**
 * 
save()	Document
validate()	Document
init()	Document
find()	Query
findOne()	Query
findOneAndUpdate()	Query
updateOne()	Query أو Document حسب الاستخدام
deleteOne()	Query أو Document حسب الاستخدام
 */