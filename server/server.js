// 引入 Express，用于创建后端 Web 服务器
import express from "express";

// 引入 cors，用于解决前后端跨域访问问题
import cors from "cors";

// 引入 dotenv，用于从 .env 文件加载环境变量
import dotenv from "dotenv";

// 引入 multer，用于处理 multipart/form-data（文件上传）
import multer from "multer";

// 引入自定义的 chat 函数（ AI 核心逻辑）
import chat from "./chat.js";


// 加载 .env 文件中的环境变量到 process.env
dotenv.config();


// 创建 Express 应用实例
const app = express();

// 启用 CORS，允许前端跨域访问本服务
app.use(cors());


// =======================
// 配置 multer（文件上传）
// =======================

// 定义文件存储规则（存到磁盘）
const storage = multer.diskStorage({
  // 指定文件保存目录
  destination: function (req, file, cb) {
    // 第一个参数是错误对象（null 表示无错误）
    // 第二个参数是文件保存路径
    cb(null, "uploads/");
  },

  // 指定保存到磁盘时的文件名
  filename: function (req, file, cb) {
    // 使用上传时的原始文件名
    cb(null, file.originalname);
  },
});

// 创建 multer 实例，并应用上面的存储规则
const upload = multer({ storage: storage });


// =======================
// 服务器配置
// =======================

// 定义服务器监听端口
const PORT = 5001;


// 用于保存最近一次上传文件的路径
//（供 /chat 接口使用）
let filePath;


// =======================
// 路由定义
// =======================

// 处理文件上传请求
// upload.single("file") 表示：
//  - 只接收一个文件
//  - 前端字段名必须叫 "file"
app.post("/upload", upload.single("file"), async (req, res) => {
  // multer 会把文件信息挂载到 req.file 上

  // 保存文件在服务器上的路径
  filePath = req.file.path;

  // 返回上传成功信息
  res.send(filePath + " upload successfully.");
});


// 处理聊天请求
app.get("/chat", async (req, res) => {
  // 从 query string 中获取用户问题
  // 例如：/chat?question=xxx
  const question = req.query.question;

  // 调用 chat 函数，传入文件路径和用户问题
  const resp = await chat(filePath, question);

  // 返回 AI 生成的文本结果
  res.send(resp.text);
});


// =======================
// 启动服务器
// =======================

// 启动 HTTP 服务并监听指定端口
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
