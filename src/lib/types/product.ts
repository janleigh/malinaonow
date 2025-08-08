export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  images?: string[];
  details?: string;
  barangay: string;
  is_available: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateProductDTO
  extends Omit<Product, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}
