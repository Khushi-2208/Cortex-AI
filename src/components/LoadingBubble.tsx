const LoadingBubble = () => {
  return (
    <div className="bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-slate-100 self-start mr-auto max-w-[80%] md:max-w-[75%] px-4 py-3 md:px-5 md:py-4 rounded-2xl rounded-bl-sm shadow-md">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-gray-500 dark:bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 dark:bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-500 dark:bg-slate-400 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export default LoadingBubble;