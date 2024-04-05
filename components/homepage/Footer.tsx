import Link from 'next/link';
import Logo from '../ui/Logo';

const Footer = () => {
  return (
    <footer className="bg-ancient-beige pt-3 bottom-0 w-full">
      <div className="container flex flex-row sm:flex-row justify-between items-center sm:items-center sm:h-[77px] pb-6 sm:pt-0 px-2 sm:px-0 mx-auto">
      <div className="flex flex-row items-center text-lg sm:text-xl sm:mb-0">
        <Logo isMobile={true}/>
        </div>
        <span className="sm:text-xl text-lg sm:text-left text-center footer-text-mobile">
          Powered by{' '}
          <a
            href="https://huggingface.co/"
            target="_blank"
            className="font-semibold transition hover:text-black/50"
          >
            Hugging Face
          </a>
          ,{' '}
          <a
            href="https://openai.com/product"
            target="_blank"
            className=" font-semibold transition hover:text-black/50"
          >
            OpenAI
          </a>
          ,{' '}
          <a
            href="https://www.pinecone.io/"
            target="_blank"
            className="font-semibold transition hover:text-black/50"
          >
            Pinecone
          </a>
          , and{' '}
          <a
            href="https://www.langchain.com/"
            target="_blank"
            className="font-semibold transition hover:text-black/50"
          >
            Langchain
          </a>
          .
        </span>
        <div className="flex justify-center sm:justify-end items-center gap-[22px] sm:gap-[39px]">
          <div className="flex space-x-4 sm:pb-0">
            <Link
              href="https://github.com/DavidGir/Camelot"
              className="group"
              aria-label="GitHub"
            >
              <svg
                aria-hidden="true"
                className="h-8 w-8 group-hover:fill-slate-700"
                viewBox="0 0 24 24"
              >
                <path 
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" 
                  stroke="black"
                  strokeWidth="0.5"
                />

              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;