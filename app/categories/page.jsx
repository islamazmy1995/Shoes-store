'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const Page = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('فشل في تحميل المنتجات:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-8">جارٍ تحميل المنتجات...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">المنتجات</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 shadow rounded-lg text-right">
            <Image
              src={product.image || '/placeholder.jpg'}
              alt={product.name}
              width={300}
              height={200}
              className="rounded mb-4 object-cover w-full h-48"
            />
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-700 mb-1">السعر: {product.price} ج.م</p>
            <p className="text-sm text-gray-500">المقاسات المتاحة: {product.available_sizes?.join(', ') || 'غير متوفر'}</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              أضف إلى السلة
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
