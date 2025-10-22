import Image from "next/image";
import Chatbot from "@/assets/AI-chatbot.jpg"
import './globals.css'
import { Button } from "@/components/ui/button";
import { FaArrowRightLong } from "react-icons/fa6";
import Link from "next/link";


export default function Home() {
  return (
    <>
    <div className="m-10 md:m-20">
        <div className="md:flex">
            <Image src={Chatbot} alt="Hero-Image" className="rounded-xl w-100 lg:w-130 self-center"/>
            <div className="mt-2 mb-2 md:ml-20 xl:mr-20 md:text-lg lg:text-xl md:mt-20">
               <h1 className="text-3xl text-center font-bold text-blue-400 mb-4 font-serif md:text-4xl lg:text-5xl">Cortex-AI</h1>
        <p className="font-semibold">Your intelligent sports companion powered by Retrieval-Augmented Generation(RAG)</p>
        <p className="font-semibold">Get instant, accurate, and up-to-date insights on cricket - all in one chat.</p>
        <div className="flex justify-center">
        <Link href="/signup"><Button variant="outline" size = "lg" className="bg-blue-400 dark:hover:bg-gray-600 light: text-white self-center mt-2 md:mt-6 md:w-35 md:h-12 md:text-lg pr-2 pl-2">Explore <FaArrowRightLong /></Button></Link>
        </div>
        </div>
        </div>
    </div>
    </>
  )
}