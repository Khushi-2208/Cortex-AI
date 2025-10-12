const promptSuggestionButton = ( {text, onClick}) => {
    return (
        <button className="prompt-suggestion-button" onClick={onclick} 
         >
            {text}
        </button>
    )
}
export default promptSuggestionButton