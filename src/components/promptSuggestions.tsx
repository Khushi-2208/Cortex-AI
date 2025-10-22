import PromptSuggestionButton from "./PromptSuggestionButton";

interface PromptSuggestionRowProps {
  onPromptClick: (prompt: string) => void;
}

const PromptSuggestionRow = ({ onPromptClick }: PromptSuggestionRowProps) => {
  const prompts = [
    "Best right arm Pacer",
    "Upcoming Cricket world cup events",
    "Best WicketKeeper Batsman",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full max-w-4xl mt-4 md:mt-8 px-4">
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton
          key={`suggestion-${index}`}
          text={prompt}
          onClick={() => onPromptClick(prompt)}
        />
      ))}
    </div>
  );
};

export default PromptSuggestionRow;