import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiEmbeddingService {
  private readonly logger = new Logger(AiEmbeddingService.name);
  private extractor: any = null;

  constructor() {}

  /**
   * Khởi tạo lazy extractor pipeline để tránh làm đơ server lúc khởi động
   */
  private async getExtractor(): Promise<any> {
    if (!this.extractor) {
      this.logger.log('Đang khởi tạo Local Transformers Pipeline (Xenova/paraphrase-multilingual-MiniLM-L12-v2)...');
      try {
        // Sử dụng dynamic import để tương thích hoàn toàn với CommonJS/ESM của NestJS
        const { pipeline } = await import('@xenova/transformers');
        
        this.extractor = await pipeline(
          'feature-extraction',
          'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
        );
        this.logger.log('Pipeline Local Transformers đã khởi tạo thành công!');
      } catch (err) {
        this.logger.error(`Lỗi khởi tạo pipeline transformers: ${err.message}`);
        throw err;
      }
    }
    return this.extractor;
  }

  /**
   * Sinh vector embedding bằng mô hình local đa ngôn ngữ (384 chiều)
   * @param text Văn bản cần sinh vector
   * @param dimensions Số chiều mặc định (Mô hình này luôn trả về 384 chiều)
   */
  async generateEmbedding(text: string, dimensions = 384): Promise<number[]> {
    const cleanText = text ? text.replace(/\n/g, ' ').trim() : '';
    if (!cleanText) {
      return new Array(dimensions).fill(0);
    }

    try {
      const extractor = await this.getExtractor();
      
      // Chạy mô hình trích xuất đặc trưng (pooling = mean, normalize = true)
      const output = await extractor(cleanText, {
        pooling: 'mean',
        normalize: true,
      });

      // Chuyển kết quả Tensor của pipeline thành mảng Javascript thông thường
      const embedding = Array.from(output.data) as number[];
      return embedding;
    } catch (err) {
      this.logger.error(`Lỗi sinh local embedding: ${err.message}`);
      // Trả về mảng số không làm fallback để hệ thống không bị lỗi crash
      return new Array(dimensions).fill(0);
    }
  }
}
