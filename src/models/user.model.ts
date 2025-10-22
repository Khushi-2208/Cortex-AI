import mongoose, { model, Schema, Model } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

export interface UserInput {
    name: string;
    email: string;
    password: string;
    refreshToken?: string;
}

export interface UserDocument extends UserInput, mongoose.Document{
    createdAt:Date;
    updatedAt:Date;
    isPasswordCorrect(password:string):Promise<boolean>;
    generateRefreshToken():string;
}

const userSchema = new Schema<UserDocument>(
    {
        name:{
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String,  
        }
    }, {timestamps:true}
)

userSchema.pre("save", async function (this:UserDocument,  next) {
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password,10)
    return next()
})

userSchema.methods.isPasswordCorrect = async function (password:string): Promise<boolean> {
    const user = this as UserDocument;
    return await bcrypt.compare(password, user.password).catch((e) => false)
}
userSchema.methods.generateRefreshToken = function ():string {
    return jwt.sign({
        _id: this._id,
        name: this.name,
        email: this.email
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
        expiresIn: '1d'
    }
)
}

export const User: Model<UserDocument> = mongoose.models.User || model<UserDocument>("User",userSchema);