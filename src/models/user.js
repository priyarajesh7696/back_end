import mongoose from './index.js'

const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:[true,"Name is required"]
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        validate:{
            validator:validateEmail,
            message: props => `${props.value} is not a valid email!`
        }
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    
   
    mobile:{
        type:Number,
        required:["Mobile is required"]
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
},
{
    collection:'users',
    versionKey:false
})

const UserModel = mongoose.model('users',userSchema)

export default UserModel