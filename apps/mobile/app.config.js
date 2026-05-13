const fs = require('fs');
const path = require('path');

// Đọc file .env từ thư mục gốc và đẩy vào process.env
try {
  const rootEnvPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(rootEnvPath)) {
    const envConfig = fs.readFileSync(rootEnvPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      // Bỏ qua các dòng comment hoặc trống
      if (!line.trim() || line.startsWith('#')) return;
      
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Chỉ set nếu chưa có hoặc để ghi đè (Expo 49+ picks up EXPO_PUBLIC_)
        process.env[key.trim()] = value;
      }
    });
  }
} catch (e) {
  console.error('Lỗi khi đọc file .env gốc:', e);
}

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
    },
  };
};
