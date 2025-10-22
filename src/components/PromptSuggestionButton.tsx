interface PromptSuggestionButtonProps {
  text: string;
  onClick: () => void;
}

const PromptSuggestionButton = ({ text, onClick }: PromptSuggestionButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className="
        bg-gray-100 
        dark:bg-slate-800 
        text-gray-900 
        dark:text-slate-100 
        border-2 
        border-gray-300 
        dark:border-slate-600 
        rounded-xl 
        px-4 
        py-3 
        md:px-5 
        md:py-4 
        text-sm 
        md:text-base 
        font-medium 
        text-left 
        shadow-md 
        transition-all 
        duration-300 
        hover:bg-blue-500 
        hover:text-white
        hover:border-blue-500 
        hover:-translate-y-1 
        hover:shadow-lg 
        active:translate-y-0
      "
    >
      {text}
    </button>
  );
};

export default PromptSuggestionButton;