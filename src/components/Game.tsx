import React, {useRef} from "react";

import kaplay from "kaplay";



export default function Game() {

    const canvasRef = useRef<HTMLCanvasElement>(null);





    return (
        <>


        <canvas ref={canvasRef} className="w-full h-full">


        </canvas>




        
        </>







    )


}