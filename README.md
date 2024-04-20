# CamelotAI

## Contents
1. [Tech Stack](#tech-stack)
2. [How Does It Work](#how-does-it-work)
3. [Deploy On Your End](#deploy-on-your-end)
4. [Common Errors](#common-errors)
5. [Future Implementations](#future-implementations)

## Tech Stack

- **[Next.js 14 App Router](https://nextjs.org/docs/app)**: Framework for full-stack apps, using the latest routing capabilities.
- **[GPT-4 through OpenAI](https://openai.com/product)**: Inference in Conversational AI.
- **[all-MiniLM-L6-v2 through HuggingFace](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)**: Creates embeddings for contextual understanding.
- **[LangChain.js](https://js.langchain.com/docs/get_started/introduction)**: Framework for retrieval augmented generation (RAG) workflow.
- **[ElevenLabs](https://elevenlabs.io/)**: Platform for Speech Synthesis (text-to-speech capabilities).
- **[Pinecone](https://www.pinecone.io/)**: Vector database for managing high-dimensional data.
- **[Bytescale](https://bytescale.com/)**: Storage solutions for PDFs and other document types.
- **[Vercel](https://vercel.com/)**: Hosting and Postgres DB for scalable web applications.
- **[Clerk](https://clerk.com/docs/quickstarts/nextjs)**: User authentication services.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework for rapid UI development.

## How Does It Work

### Video Walkthrough of Corporate Release - Multi-Tabs View 
https://github.com/DavidGir/CamelotAI/assets/142949344/14c1c64d-373f-4253-85e3-e75cff5358c0

---

## Deploy On Your End

You can use my template to deploy on Vercel or a hosting service of your choice. However, bare in mind that you will need to establish all the required environment variables. I made a .env.example file for you to refer to. You will find all the necessary env variables you'll need. 
Here are the following setup steps:

### Set up a [Hugging Face Hub account](https://huggingface.co/):

Hugging Face is a machine learning (ML) and data science platform and community that helps users build, deploy and train machine learning models. It is a great place to test a variety of LLM models. You can also search models via their filter for specific tasks categories like Computer Vision, MultiModal, Natural Language Processing, etc. It's a great platform. I recommend downloading their brand new free feature called [HuggingChat](https://huggingface.co/chat/). Its also available as a mobile app! You can test the most popular and trending models on there via a chat interface. 

- Once you have an account with HF get your API key. Click on your profile picture on the top right of your screen. Then select ```settings```. Then select ```Access Tokens``` on the side nav bar and create a new API key. 

<img width="1004" alt="Screenshot 2024-04-20 at 10 54 48 AM" src="https://github.com/DavidGir/CamelotAI/assets/142949344/650a2f87-fcef-47d3-98a7-9a6f1386aa7a">

 - Place your API key as ```HUGGINGFACEHUB_API_KEY= ``` in your .env file.

---

### Set up [Pinecone](https://www.pinecone.io/):

Pinecone is just great. It is a vector-based database that offers high-performance search and similarity matching. It can deal with high-dimensional vector data at a higher scale, easy integration, and faster query results. It's easy to setup and it's also serverless, it means that all the underlying compute resources of the vector db, infrastructure management, scaling, and maintenance are handled by Pinecone. There are no pods, shards, replicas, sizes, or storage limits to think about or manage. Simply name your index, load your data, and start querying through the API or their client.

**Important** - Make sure you assign the proper dimensions to your Pinecone index which should be according to your model's dimensions. You can get that info through Hugging Face when selecting your model. It has its own model card preview where you can get such info. As for the metric, cosine is pretty standard, but it might depend on your usecase. **For our case, all-MiniLM-L6-v2 has 384 dimensions; set the Pinecone index accordingly.**

<img width="992" alt="Screenshot 2024-04-20 at 11 06 52 AM" src="https://github.com/DavidGir/CamelotAI/assets/142949344/55b7b649-a705-419c-8c5f-b33ec4469a19">

- Once you have an account with Pinecone, you'll get **$100 serverless credits** which is ample enough for our case.
- You will see ```API keys``` on the side nav bar. Click on that and create your new API key.
- Place your API key as ```PINECONE_API_KEY=``` in your .env file.
- Please be advised that you will also need to store your Pinecone index name (under ```PINECONE_INDEX_NAME```in your .env file), it will be the index that will store your vector embeddings.

<img width="1416" alt="Screenshot 2024-04-20 at 11 17 03 AM" src="https://github.com/DavidGir/CamelotAI/assets/142949344/b1aca5ad-0dfa-41bc-b44e-e38004fb7903">

---

### Set up [Bytescale](https://bytescale.com/):

Bytescale has a straight forward uloader widget that simplifies file uploading, file processing, content optimization, and content delivery. They have a folder/file storage structure that is used for storing the documents you upload in the widget's drop zone. 

- Get an account and you will get a **15 days trial**
- You will see that Bytescale has two API keys, one that is public and one that is secret. 
- Place your API public key as ```NEXT_PUBLIC_BYTESCALE_API_KEY=``` and the secret as ```NEXT_SECRET_BYTESCALE_API_KEY=```.
- Your secret key is required for you to be able to delete documents from the Bytescale storage.

---

### Set up [Vercel](https://vercel.com/):

Vercel offers a fast and easy way to deploy web projects, with automatic scaling and support for modern web technologies like serverless functions. It's super compatible with a Next.js project and makes hosting relatively easy. You will have production and development deployments as well as previews. Production deployments stems from pushed commits made to your ```main``` branch and development deployments from your ```development``` branch. 

- Get an account with Vercel and create a new project by importing your repo from Github.
- In our case, we will be hosting a PostgreSQL database through Vercel and using prisma as an ORM.
- There is a ```storage``` selection option where you can create a new db; select Postgres - serverless psql and name it.
- From there you will see a ```Quickstart``` menu where you can get all the env variables you need for hosting your psql db which will be used in your .env file.
- Follow and refer yourself to the env variables placeholders in the .env.example file in the root directory of the app.

---

### Set up [ElevenLabs](https://elevenlabs.io/):

ElevenLabs is awesome. It also is a featured integration when you host on Vercel, which implies that Vercel will automatically load the ElevenLabs API key as a env variable in your hosted project. Amongst its services, it offers text-to-speech API services. Their speech synthesis models are top notch, featuring a great language diversity and voice selections. You can also clone your voice if you feel adventurous. 
**The free tier gets you a limit 10,000 Characters per month (~10 min audio)**.

- Set up an ElevenLabs account and get your API key and place it as ```ELEVENLABS_API_KEY=``` in your .env file.
- You you will have access to a voice lab section once you have an account. That's where you can choose up to three voices from the voice library and simply add them to your voice lab dashboard. Then you can add them to be part of this app (you can replace voice names that I have set up in my ```getVoices.ts``` file with the ones you seek).

---

### Set up [Clerk](https://clerk.com/docs/quickstarts/nextjs)

Clerk is an easy and straightforward way of setting authentication into your app. It is compatible with Next.js App Router. 

- Set up a Clerk account and get your API keys (public and secret) and place them as ```NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=``` & ```CLERK_SECRET_KEY=```.
  
---

### Setting the app for development locally:

Simply just fork this repo and clone it. 

To run development:

```bash
npm run dev
```

I set up a mjs file that runs a script to automatically open a web browser tab to start the dev env on localhost:3000.

**Prisma ORM** 

To seed your vercel hosted psql db, i made run commands in the script portion of the ```package.json``` file. Enter the following commands in your terminal:

```bash
npm run prisma:migrate
// Original command from Prisma is:
npx prisma migrate dev
```

Also ensure to generate prisma which also needs to be done when updating the schema models to ensure the Prisma Client has the updates. 

```bash
npm run prisma:generate
// Original command from Prisma is:
npx prisma generate
```

---

## Common Errors

- Ensure that you've created an .env file that contains your valid (and working) API keys, environment variables and Pinecone index name.
- ElevenLabs has a free tier multi-lingual modal. Some voices are not part of that free model.

## Future Implementations

- Implement Unstructured with LangChain-js as the new ingester. It can ingest up to 26 different types of files. (Currently in the works!! 🙇)
- Implement version that takes all files without a pdf viewer. A viewing alternative needs to be established. 
- Implement own uploader solution.
- Implement mobile design.
- Perhaps local implementation with OLLAMA.


