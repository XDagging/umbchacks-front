// import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";



export default function InterComponentNav() {


    return (
        <>
        <div className="bg-base-200 rounded-box w-full font-1 gap-2 flex flex-row items-center p-1">
            <Link to="/" className="btn btn-ghost btn-sm">
                 <ArrowLeft />

            </Link>
           
           Go back to the homepage
        </div>
        
        </>

    )
}