import { Message } from "@/app/dashboard/page";

interface BubbleProps {
  message: Message;
}

const Bubble = ({ message }: BubbleProps) => {
  const { content, role } = message;
  
  return (
    <div 
      className={`
        max-w-[80%] md:max-w-[75%] lg:max-w-[70%] 
        px-4 py-3 md:px-5 md:py-4 
        rounded-2xl 
        shadow-md 
        leading-relaxed 
        text-sm md:text-base
        animate-fadeIn
        ${role === "user" 
          ? "bg-blue-500 text-white self-end ml-auto rounded-br-sm" 
          : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-slate-100 self-start mr-auto rounded-bl-sm"
        }
      `}
    >
      <div className="whitespace-pre-wrap break-words">
        {content}
      </div>
    </div>
  );
};

export default Bubble;