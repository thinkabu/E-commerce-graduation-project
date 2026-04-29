export interface Product {
  _id: string;
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
}
