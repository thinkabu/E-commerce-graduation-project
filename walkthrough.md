# Walkthrough: Triển khai Hệ thống Gợi ý AI (CF + Vector Search + AI Ranking)

Chúng ta đã triển khai thành công cấu trúc database (Mongoose Schemas) và lõi thuật toán xử lý đa tầng (Multi-stage AI Recommendation System) kết hợp **Collaborative Filtering**, **Vector Search**, và **AI Ranking**.

---

## 🛠️ Các Thay đổi & File mới Đã tạo

### 1. Database Schemas (Feature Store & Loggers)
Chúng ta đã tạo 5 Schema mới trong thư mục [schemas](file:///d:/DATN/apps/backend/src/modules/recommendations/schemas):
*   [user-cf-recommendation.schema.ts](file:///d:/DATN/apps/backend/src/modules/recommendations/schemas/user-cf-recommendation.schema.ts): Lưu cache danh sách Top-N gợi ý từ thuật toán Collaborative Filtering (được chạy offline/async định kỳ).
*   [user-profile-embedding.schema.ts](file:///d:/DATN/apps/backend/src/modules/recommendations/schemas/user-profile-embedding.schema.ts): Lưu vector embedding biểu diễn sở thích tích lũy của User (được tổng hợp từ các sản phẩm đã tương tác) phục vụ tìm kiếm Vector cá nhân hóa.
*   [user-recommendation-profile.schema.ts](file:///d:/DATN/apps/backend/src/modules/recommendations/schemas/user-recommendation-profile.schema.ts): Feature Store lưu các đặc trưng hành vi của User (danh mục yêu thích, thương hiệu ưa chuộng, mức chi tiêu trung bình).
*   [product-recommendation-metrics.schema.ts](file:///d:/DATN/apps/backend/src/modules/recommendations/schemas/product-recommendation-metrics.schema.ts): Feature Store lưu các thống kê 30 ngày của sản phẩm (CTR, CVR, lượt click, lượt bán, điểm phổ biến) để đưa vào mô hình xếp hạng.
*   [recommendation-feedback-log.schema.ts](file:///d:/DATN/apps/backend/src/modules/recommendations/schemas/recommendation-feedback-log.schema.ts): Lưu vết hiển thị (impressions), các cú click và hành vi mua hàng từ đề xuất phục vụ A/B Testing và tính CTR thực tế.

### 2. Tích hợp NestJS Module
*   [recommendations.module.ts](file:///d:/DATN/apps/backend/src/modules/recommendations/recommendations.module.ts): Đã import và đăng ký tất cả các schema trên vào `MongooseModule.forFeature` để các Service/Controller có thể trực tiếp sử dụng.

### 3. Triển khai Lõi Thuật toán Recommendation
*   [recommendations.service.ts](file:///d:/DATN/apps/backend/src/modules/recommendations/recommendations.service.ts): Đã nâng cấp toàn diện quy trình 3 giai đoạn:
    1.  **Giai đoạn 1 (Retrieval - Truy xuất ứng viên)**:
        *   **Collaborative Filtering (CF)**: Đọc từ cache gợi ý ALS pre-computed của user, nếu chưa có thì fallback về top sản phẩm phổ biến.
        *   **Personalized Vector Search**: Thực hiện so sánh vector của `UserProfileEmbedding` (hoặc sản phẩm xem cuối cùng) với toàn bộ `ProductEmbedding`.
        *   *Hỗ trợ Fallback Cosine Similarity*: Viết sẵn hàm tính cosine similarity trên Javascript để hệ thống chạy trơn tru ở môi trường Local dev không có MongoDB Atlas Vector Search Index.
    2.  **Giai đoạn 2 (Feature Enrichment)**:
        *   Đọc song song các đặc trưng từ `UserRecommendationProfile` và `ProductRecommendationMetrics`.
    3.  **Giai đoạn 3 (AI Ranking/Re-ranking)**:
        *   Áp dụng công thức tính điểm lai (Hybrid scoring):
            $$\text{Score} = (w_{Vector} \times \text{Similarity}) + (w_{CF} \times \text{CFScore}) + (w_{Popularity} \times \text{PopularityScore}) + (w_{Context} \times \text{ContextScore})$$
        *   Tự động phát hiện lý do gợi ý tối ưu nhất (ví dụ: *"Tương tự các sản phẩm bạn đã xem gần đây"*, *"Khách hàng có sở thích giống bạn cũng mua sản phẩm này"*).
        *   **Impressions Logging**: Tự động lưu toàn bộ lượt đề xuất kèm một `sessionId` định danh để ghi nhận phản hồi.
*   [recommendations.controller.ts](file:///d:/DATN/apps/backend/src/modules/recommendations/recommendations.controller.ts): Thêm 2 api POST `/recommendations/click` và POST `/recommendations/purchase` nhận `sessionId` và `productId` để ghi log phản hồi từ Client.

---

## ⚡ Giải thích Cơ chế hoạt động của Recommendation System (CF + Vector + AI Ranking)

Hệ thống hoạt động theo mô hình **Multi-stage Recommendation Pipeline** chuẩn công nghiệp:

### 1. Collaborative Filtering (CF)
*   **Nguyên lý**: Gợi ý dựa trên sự tương đồng hành vi giữa những nhóm người dùng (*"Người dùng thích A cũng thích B"*).
*   **Cách hoạt động**: Bản chất thuật toán Matrix Factorization (như ALS) cần lượng lớn dữ liệu tương tác để phân rã ma trận. Do đó, quy trình này chạy **offline / bất đồng bộ** (ví dụ 1 lần mỗi đêm). Kết quả được ghi trực tiếp vào `UserCFRecommendation`. 
*   **Lợi ích**: Tìm ra được các liên kết phi tuyến tính, phi ngữ nghĩa mà mô hình ngữ nghĩa không nhận biết được (ví dụ: người mua máy ảnh thường mua kèm thẻ nhớ dù hai sản phẩm có tên hoàn toàn khác nhau).

### 2. Vector Search (Semantic & Content-based)
*   **Nguyên lý**: Tìm các sản phẩm có điểm tương đồng cao nhất về ngữ nghĩa, mô tả hoặc đặc tính kỹ thuật với sở thích của người dùng.
*   **Cách hoạt động**:
    *   Mỗi sản phẩm có 1 vector embedding đại diện cho đặc tính ngữ nghĩa.
    *   Mỗi người dùng có 1 `UserProfileEmbedding` đại diện cho lịch sử quan tâm của họ.
    *   Hệ thống dùng thuật toán so khớp vector (Cosine Similarity) để quét và lấy ra các sản phẩm gần nhất với sở thích của người dùng.
*   **Lợi ích**: Khắc phục hiện tượng **Cold-Start** (sản phẩm mới chưa có lượt click/mua nào thì CF không gợi ý được, nhưng Vector search có thể gợi ý được ngay dựa trên mô tả sản phẩm).

### 3. AI Ranking (Lọc & Xếp hạng lại)
*   **Nguyên lý**: Trộn kết quả từ CF và Vector Search, sau đó tính toán điểm số tối ưu nhất dựa trên ngữ cảnh thực tế của User và độ "hot" của sản phẩm.
*   **Cách hoạt động**:
    *   Nhận danh sách ứng viên (candidates) từ 2 nguồn trên.
    *   Nạp thông tin thuộc tính người dùng (ví dụ: tầm giá yêu thích, danh mục ưu tiên) và chỉ số sản phẩm (CTR, CVR) từ Feature Store.
    *   Áp dụng công thức chấm điểm lai để sắp xếp lại (Re-rank) đưa sản phẩm tốt nhất lên đầu.
*   **Lợi ích**: Tối ưu hóa tối đa Click-Through Rate (CTR) và tỷ lệ chuyển đổi (CVR), cá nhân hóa ở mức cao nhất.

---

## 🧪 Xác minh Kết quả (Verification Results)

Chúng ta đã chạy build dự án backend NestJS thành công:
```bash
> backend@0.0.1 build
> nest build
```
Dự án compile hoàn toàn thành công mà không có lỗi TypeScript hay cú pháp nào, sẵn sàng tích hợp chạy thực tế.
