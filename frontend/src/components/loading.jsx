import { useEffect, useState } from 'react';

function Loading({
  messages = [],
  className = '',
  compact = false,
  interval = 1800,
}) {
  const fallbackMessages = [
    'Thinking...',
    'Analyzing your content...',
    'Finding the strongest matches...',
    'Preparing the next step...',
  ];

  const messageList = messages.length > 0 ? messages : fallbackMessages;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (messageList.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % messageList.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, messageList.length]);

  return (
    <div className={`flex items-center gap-3 ${compact ? 'text-xs' : 'text-sm'} ${className}`}>
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <span className="w-2 h-2 rounded-full bg-current animate-pulse [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-current animate-pulse [animation-delay:300ms]" />
      </span>
      <span className="font-medium">
        {messageList[activeIndex]}
      </span>
    </div>
  );
}

export default Loading;
