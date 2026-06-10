import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: '儿童彩妆选购助手平台后端服务运行正常',
    timestamp: new Date().toISOString(),
  });
});

// 404 处理
app.use((_req, res) => {
  res.status(404).json({
    error: '接口不存在',
    code: 404,
  });
});

// 错误处理
app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message,
    code: 500,
  });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║   🎨 儿童彩妆选购助手平台 - 后端服务                      ║
  ║                                                          ║
  ║   🚀 服务已启动: http://localhost:${PORT}                   ║
  ║   📡 API 前缀: http://localhost:${PORT}/api                ║
  ║   💊 健康检查: http://localhost:${PORT}/health              ║
  ║                                                          ║
  ║   帮家长擦亮眼睛，让孩子美丽又安全                        ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});
