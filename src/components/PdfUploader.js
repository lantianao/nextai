import React from "react";
import axios from "axios"; // Import axios for HTTP requests
import { InboxOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";


const { Dragger } = Upload;


const DOMAIN = "http://localhost:5001";

//把浏览器里的 File 对象，通过 multipart/form-data 的方式上传到后端，并异步获取结果
const uploadToBackend = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await axios.post(`${DOMAIN}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",//告诉服务器：“我发的是一个 文件上传请求，格式是 multipart/form-data。”
      },
    });
    return response;
  } catch (error) {
    console.error("Error uploading file: ", error);
    return null;
  }
};


// Dragger（拖拽上传组件）的配置对象
// 这个对象会作为 props 传给 <Upload.Dragger {...attributes} />
const attributes = {
  // 上传时 FormData 中的字段名
  // 必须和后端 upload.single("file") 保持一致
  name: "file",
  // 是否支持一次上传多个文件
  // true 表示可以同时拖拽多个文件
  multiple: true,
  // 自定义上传逻辑（⭐核心）
  // 用来接管 antd 默认的上传行为
  customRequest: async ({ file, onSuccess, onError }) => {
    try {
      // 调用你自己封装的上传函数，把文件传给后端
      const response = await uploadToBackend(file);
      // 如果后端返回成功状态
      if (response && response.status === 200) {
        // 通知 antd：该文件上传成功
        // 会把 file.status 设为 "done"
        onSuccess(response.data);
      } else {
        // 通知 antd：上传失败
        onError(new Error("Upload failed"));
      }
    } catch (err) {
      // 捕获异常（网络错误等）
      onError(err);
    }
  },
  // 文件状态变化时的回调函数
  // 上传中 / 成功 / 失败都会触发
  onChange(info) {
    // info.file 表示当前操作的文件
    // info.fileList 表示所有文件列表
    const { status } = info.file;
    // 只要不是 uploading 状态，就打印调试信息
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    // 上传成功时的提示
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    }
    // 上传失败时的提示
    else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  // 当用户把文件拖拽到上传区域并松开鼠标时触发
  onDrop(e) {
    // e.dataTransfer.files 是拖拽进来的文件列表
    console.log("Dropped files", e.dataTransfer.files);
  },
};


const PdfUploader = () => {
  return (
    <Dragger {...attributes}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        Click or drag file to this area to upload
      </p>
      <p className="ant-upload-hint">
        Support for a single or bulk upload. Strictly prohibited from uploading
        company data or other banned files.
      </p>
    </Dragger>
  );
};


export default PdfUploader;
