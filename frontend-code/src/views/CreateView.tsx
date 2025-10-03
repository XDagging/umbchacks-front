// import React from "react";
import Ad from "../components/Ad";
import InterComponentNav from "../components/InterComponentNav";


export default function CreateView() {



    return (
        <>

        {/* I want it to feel game-y but also productive. Let's make it something cop */}

        <section className="flex flex-col m-3 gap-2 w-4/6 mx-auto items-center">
            <InterComponentNav />

            

            <div className="w-full">
        <Ad />
            </div>
            

            <div className="w-full m-3 bg-base-200 p-4 rounded-box">
                <h1 className="text-3xl font-1 font-semibold">   
                    Let's get to learning
                </h1>

                <p></p>
        
                <textarea className="textarea w-full  mt-2"></textarea>
                
                
            </div>

        </section>
        
        
        
        
        
        </>
    )
}