import React from "react";


// import {ChevronLeftIcon, PhoneIcon, VideoCameraIcon} from "lucide-react";
import { ChevronLeftIcon, PhoneIcon, VideoIcon, Phone } from 'lucide-react';




export default function PhoneComponent() {






    return (
        <>
             <div className="mockup-phone absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-70">
  {/* <div className="mockup-phone-camera"></div> */}
  <div className="mockup-phone-display bg-base-300 ">
    <div className='w-full p-5 bg-base-100 flex md:flex-row flex-row items-center border-b border-neutral'>
      <ChevronLeftIcon className='size-6' />
<p className='font-1 text-left ml-2 font-semibold flex-1'>Ashley</p>

<div className='flex-0 flex flex-row gap-4'>
    <PhoneIcon className='size-6' />
    <VideoIcon className='size-6' />

</div>
    </div>


    <div>
    

        <div>
        {/* Stuff inside the phone */}
            <div className="flex flex-col py-10  gap-2 items-center">




                <div className="p-10 rounded-box bg-primary flex flex-col items-center gap-2">
                    <Phone />
                    <div className="">Phone</div>
                </div>
    



            </div>


        </div>
    </div>
    
    <div>



    </div>

  </div>
  {/* <div className="mockup-phone-display text-white grid place-content-center">It's Glowtime.</div> */}
</div>

        
        
        
        </>
    )


}