import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[ture,"Name is required"]
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minLength:[6,"Password must be at least 6 characters long"]
    },
    cartItems:[
        {
            quantity:{
                type:Number,
                default:1
            },
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product'
            }
        }
    ],
    role:{
        type:String,
        enum:['customer','admin'],
        default:'customer'
    }
    //createdAt,updatedAt
},{

    timestamps:true
})

const User = mongoose.model("User",userSchema)

export default User;