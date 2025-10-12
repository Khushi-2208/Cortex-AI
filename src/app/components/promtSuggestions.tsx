import promptSuggestionButton from "./PromptSuggestionButton"
const PromptSuggestionRow = ({onPromptClick}) => {
    const prompts = [
        "Who is the ICC T'20s world champion?",
        "Who is the highest paid cricketer?",
        "Who is the world badminton champion",
        "Suggest some fictional books."
    ]
    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) => <promptSuggestionButton key={`suggestion-${index}`} 
            text = {prompt}
            onClick = {() => onPromptClick(prompt)}
            />)}
        </div>
    )
}
export default PromptSuggestionRow