"use client"

import { useRef, useState } from "react"
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";

export default function MessageInput()  {
  const [text,setText] = useState("");
  const [ImagePreview, setImagePreview] = useState(null);
  // fileInputRef.current is the second input element that accepts images
  const fileInputRef = useRef();
  const { sendMessage} = useChatStore();

  function handleImageChange(e) {
    const file = e.target.files[0];
    if(!file) return
    if(file.type.startsWith("image/")===false) {
      toast.error("Please select an image file")
      return;
    }
    // console.log(file.name)

    const reader = new FileReader();

    reader.onload = () => {
      const base64Image = reader.result
      setImagePreview(base64Image);
    }

    reader.readAsDataURL(file);
  }
  function removeImage() {
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }
  async function handleSendMessage(e) {
    e.preventDefault();
    if(text.trim()==="" && ImagePreview===null) return
    try{
      await sendMessage({text:text, image:ImagePreview});
      setText("");
      setImagePreview(null)
      if(fileInputRef.current) fileInputRef.current.value = "";
    }

    catch(error) {
      toast.error(`Failed to send message ${error}`)
    }
    
    
  }

  // Send button is disabled when there is no text or image to send 
  let isDisabled = false;
  if(text.trim()=="" && ImagePreview==null) {isDisabled=true};

  return (
    <div className="p-4 w-full">
      
      {/* Image preview UI(Shows an image preview with a remove button only when an image is selected.) */}
      {ImagePreview ? 
      <div className="mb-3 flex items-center gap-2">
        <div className="relative">
          <img src={ImagePreview} alt="ImagePreview" className="sm:size-29 size-24 object-cover rounded-lg border border-zinc-700"/>

          <button 
           type="button"
           onClick={removeImage}
           className="absolute top-1.5 right-1.5 size-5 rounded-full bg-base-300 flex justify-center items-center"
           >
            <X className="size-3"/>
          </button>
        </div>

      </div>
       : null
      }

      {/* Message Input form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input type="text" 
         className="w-full input input-bordered rounded-lg sm:input-md input-sm" 
         placeholder="Type a message.."
         value={text}
         onChange={(e)=>{setText(e.target.value)}}
         />

        <input 
         type="file" 
         name="" 
         accept="image/*" 
         className="hidden"
         ref={fileInputRef}
         onChange={handleImageChange}
        />

        <button 
         type="button" 
         onClick={()=>{fileInputRef.current ?  fileInputRef.current.click() : null}}
         className={`btn btn-primary hover:bg-primary/60`}
         >
          <Image size={20}/>
        </button>

        {/* Submit Button */}
        <button 
         type="submit"
         className="btn btn-primary hover:bg-primary/60"
         disabled={isDisabled}>
          <Send size={22}/>
        </button>

      </form>

    </div>
  )
}


