import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";


import { PDFLoader } from "langchain/document_loaders/fs/pdf";


// NOTE: change this default filePath to any of your default file name
const chat = async (filePath = "./uploads/default.pdf", query) => {
  // step 1:
  const loader = new PDFLoader(filePath);


  const data = await loader.load();//get data from pdf
  console.log('pdf: ',data)

  // step 2: split the pdf
  const textSplitter = new RecursiveCharacterTextSplitter({//LangChain 提供的 智能切分器
    chunkSize: 500, //  (in terms of number of characters)
    chunkOverlap: 0,//相邻 chunk 不共享内容
  });


  const splitDocs = await textSplitter.splitDocuments(data);
  console.log('split docs : ',splitDocs)

  // step 3 

  //langchain calls openai api
  const embeddings = new OpenAIEmbeddings({//创建一个“向量生成器”,用来把 pageContent 转成向量
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });


  const vectorStore = await MemoryVectorStore.fromDocuments(//把文本变成向量并存储
    splitDocs,
    embeddings
  );
  console.log("vector Store: ",vectorStore )

  // step 4: retrieval


  // const relevantDocs = await vectorStore.similaritySearch(
  // "What is task decomposition?"
  // );


  // step 5: qa w/ customzie the prompt
  const model = new ChatOpenAI({//创建一个对话型大模型实例
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  //自定义Prompt
  const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.


{context}
Question: {question}
Helpful Answer:`;

// 1️⃣ model
// 用哪个 LLM 来回答问题
// 2️⃣ vectorStore.asRetriever()
// 把向量数据库变成一个 检索器
// 职责：
// 根据 query，找出最相关的文档 chunk
// 3️⃣ prompt
// 使用你自定义的 Prompt
// 覆盖默认 QA Prompt
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: PromptTemplate.fromTemplate(template),
    // returnSourceDocuments: true,
  });


  const response = await chain.call({
    query,//query is client's question(a string)
  });


  return response;
};


export default chat;