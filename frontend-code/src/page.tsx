import React, {useState, useEffect} from 'react';
import Game from './components/Game';
import Marquee from "react-fast-marquee";
import PhoneComponent from './components/PhoneComponent';

export default function HomePage() {

    const [hasGameStarted, setHasGameStarted] = useState(true);
// 
    // kaplay();



    return (

        <>
{/* <p className='text-4xl'>the thing is the thing</p>
    
<p className='btn btn-primary'>hello world</p> */}

<section className='w-screen h-screen'>

    {!hasGameStarted ? <>
    <section className="w-full h-full">
        <Marquee className='flex items-center justiy-between'> {/* Use items-center for vertical alignment */}
    <p className='font-1 mr-16'> {/* Adjust mr-16 (margin-right) as needed */}
        You're probably broke
    </p>

    <p className='font-1 mr-16'> {/* Use the same margin on all items */}
        Let me guess, you blew your money on something stupid again?
    </p>
    <p className='font-1 mr-16'> {/* Use the same margin on all items */}
        Womp Womp!
    </p>
    
     <p className='font-1 mr-16'> {/* Use the same margin on all items */}
        Cry about it
    </p>
    
    {/* Add more items with the same margin class */}
</Marquee>


<div className=''>
<p></p>

</div>




    </section>




    
    </> :<> 


    <div className='grid grid-cols-6 items-start justify-start w-screen h-full'>


        <div className='col-span-4 w-full h-full'>
               <Game></Game>


        </div>

        <div className="col-span-2 w-full h-full relative">
            <PhoneComponent />

        </div>
            
 


    </div>

    </>}
</section>



        
        
        
        
        </>
    )


}