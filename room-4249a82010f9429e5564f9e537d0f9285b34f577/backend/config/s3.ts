import { S3Client } from '@aws-sdk/client-s3';

// 检查必要的环境变量
const requiredEnvVars = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'BUCKET_NAME'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName as keyof typeof process.env]);

if (missingEnvVars.length > 0) {
  console.error('AWS/S3 environment variables not configured:', {
    AWS_REGION: process.env.AWS_REGION ? 'set' : 'missing',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'set' : 'missing',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'set' : 'missing',
    BUCKET_NAME: process.env.BUCKET_NAME ? 'set' : 'missing',
  });
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}. Please set these variables.`
  );
}

// 类型定义
interface S3Config {
  BUCKET_NAME: string;
  REGION: string;
  FOLDER_PREFIX: string;
  PRESIGNED_URL_EXPIRY: number;
}

// 创建 S3 客户端
export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // 添加重试策略
  maxAttempts: 3,
});

// S3 配置
export const S3_CONFIG: S3Config = {
  BUCKET_NAME: process.env.BUCKET_NAME!,
  REGION: process.env.AWS_REGION!,
  FOLDER_PREFIX: 'user-content',
  PRESIGNED_URL_EXPIRY: 3600, // 1 hour in seconds
};
