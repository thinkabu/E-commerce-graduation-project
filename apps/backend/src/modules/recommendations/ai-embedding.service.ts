import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiEmbeddingService {
  private readonly logger = new Logger(AiEmbeddingService.name);

  constructor() {}

  /**
   * Sinh vector embedding mô phỏng cục bộ từ văn bản (Không gọi API ngoài)
   * @param text Văn bản đầu vào cần tạo embedding
   * @param dimensions Số chiều mong muốn (mặc định 1536)
   */
  async generateEmbedding(text: string, dimensions = 1536): Promise<number[]> {
    const cleanText = text ? text.replace(/\n/g, ' ').trim() : '';
    if (!cleanText) {
      return this.generateDeterministicMockEmbedding('empty', dimensions);
    }

    this.logger.debug(`Generating local mock embedding for: "${cleanText.substring(0, 30)}..."`);
    return this.generateDeterministicMockEmbedding(cleanText, dimensions);
  }

  /**
   * Tạo vector băm chuẩn hóa bằng giải thuật LCG (Linear Congruential Generator)
   * Nhằm đảm bảo cùng 1 văn bản đầu vào sẽ cho ra 1 vector duy nhất, hỗ trợ so khớp cosine
   */
  private generateDeterministicMockEmbedding(text: string, dimensions: number): number[] {
    const vector: number[] = [];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    let seed = Math.abs(hash) || 1;
    // Hàm sinh số ngẫu nhiên giả lập dựa trên seed cố định
    const lcg = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (let i = 0; i < dimensions; i++) {
      vector.push(lcg() * 2 - 1); // Trả về số trong khoảng [-1, 1]
    }

    // Chuẩn hóa vector về độ dài bằng 1 (Unit Vector) để tích vô hướng chính là độ tương đồng Cosine
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / (magnitude || 1));
  }
}
