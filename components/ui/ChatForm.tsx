import LoadingDots from '@/components/ui/LoadingDots';
import { ChatFormProps } from '@/app/types/chatTypes';
import { PiFloppyDiskBold } from "react-icons/pi";

export default function ChatForm({
  isLoading,
  input,
  handleInputChange,
  handleSubmit,
  handleEnter,
  handleSaveChat,
  textAreaRef,
  hasUnsavedMessages,
  hasChats,
  handleDeleteChat,
}: ChatFormProps) {
  return (
    <form
      id="chatForm"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
      className="relative w-full px-4 pt-2 sm:pt-10 flex flex-col"
    >
      <textarea
        className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 pr-10 text-black focus:outline-gray-400"
        disabled={isLoading}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleEnter}
        ref={textAreaRef}
        rows={3}
        autoFocus={false}
        maxLength={512}
        id="userInput"
        name="userInput"
        placeholder={
          isLoading ? 'Waiting for response...' : 'Ask your question...'
        }
      />
      <button
        type="submit"
        disabled={isLoading}
        className="absolute right-6 top-[40px] flex rounded-sm border-none bg-transparent px-2 py-1 text-gray-600 transition duration-300 ease-in-out sm:top-[71px]"
      >
        {isLoading ? (
          <div className="">
            <LoadingDots color="#000" style="small" />
          </div>
        ) : (
          <svg
            viewBox="0 0 20 20"
            className="h-6 w-6 rotate-90 transform fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        )}
      </button>
      <div className="flex justify-between pt-2">
        <button
            type="button"
            title="Save Chat"
            onClick={handleSaveChat}
            disabled={isLoading || !hasUnsavedMessages}
            className={`rounded-full border-none px-2 py-2 text-black transition duration-300 ease-in-out
            ${isLoading || !hasUnsavedMessages ? ' cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-500'}`}
        >
          <PiFloppyDiskBold className=""/>
        </button>
        <button 
          onClick={handleDeleteChat} 
          disabled={!hasChats || isLoading} 
          className={`rounded-full border-none px-2 py-2 text-black transition duration-300 ease-in-out
          ${isLoading || !hasChats ? ' cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-500'}`}
        >
          Clear Saved Chats
        </button>
      </div>
    </form>
  );
}
