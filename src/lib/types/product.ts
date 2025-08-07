export interface Product {
  id: string;
  name: string;
  name_fil?: string;
  name_akl?: string;
  description: string;
  description_fil?: string;
  description_akl?: string;
  image_url: string;
  barangay: string;
  is_available: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateProductDTO
  extends Omit<Product, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}
