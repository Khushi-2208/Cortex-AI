"use client"
import Image from "next/image"
import AppLogo from "@/assets/AppLogo.png"
import { useChat} from "@ai-sdk/react"
import { Message } from "ai"
import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionRow from "./components/promtSuggestions"
const Home = () => {

    const {input, handleInputChange, HandleSubmit, isLoading, messages, append} = useChat()

    const noMessages = !messages || messages.length === 0

    const handlePrompt = (promptText) => {
        const msg: Message = {
            id:crypto.randomUUID(),
            content: promptText,
            role:"user"
        }
        append(msg)
    }

    return (
        <main>
            <Image src = {AppLogo} width="250" alt="Logo" />
            <section className={noMessages? "" : "populated"}>
             {noMessages ? (
                <>
                <p className="text-center text-2xl">
                    Ask anything related to sports and all
                </p>
                <br />
                <PromptSuggestionRow onPromptClick={handlePrompt} />
                </>
             ):(
                <>
                {messages.map((message, index) => <Bubble key={`message-${index}`} message = {message} />)}
                {isLoading && <LoadingBubble />}
                </>
             )}

            </section>
            <form onSubmit={HandleSubmit}>
                <input type="text" className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me Something..."/>
                <input type="submit" />
             </form>
        </main>
    )
}
