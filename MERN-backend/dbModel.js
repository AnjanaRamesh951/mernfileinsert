import mongoose from 'mongoose';
const instance=mongoose.Schema({
    
    user:String,
    image:String,
    
})
export default mongoose.model("posts",instance);