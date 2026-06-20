import type { Product, ApiResponse } from '~/types'

interface ProductListData {
  products: Product[]
  total: number
}

export function useProducts(opts?: { categorySlug?: string; sort?: string; limit?: number }) {
  const apiBase = useApiBase()
  const params = computed(() => ({
    categorySlug: opts?.categorySlug ?? 'sneakers',
    sort: opts?.sort ?? 'newest',
    limit: opts?.limit ?? 20,
    offset: 0,
  }))

  return useFetch<ApiResponse<ProductListData>>('/products', {
    baseURL: apiBase,
    params,
    key: `products-${JSON.stringify(opts)}`,
    transform: (res) => res.data,
  })
}

export function useProduct(slug: string) {
  const apiBase = useApiBase()
  return useFetch<ApiResponse<Product>>(`/products/${slug}`, {
    baseURL: apiBase,
    key: `product-${slug}`,
    transform: (res) => res.data,
  })
}
