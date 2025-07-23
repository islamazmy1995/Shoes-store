'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // جلب بيانات السلة من الباك اند
  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/cart`);
      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.error('خطأ أثناء تحميل السلة:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await fetch(`${API_BASE}/cart?id=${id}`, {
        method: 'DELETE',
      });
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('خطأ في حذف العنصر:', err);
    }
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <p className="text-center py-8">جارٍ تحميل السلة...</p>;

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">سلة المشتريات</h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600">السلة فارغة.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row items-center bg-white shadow p-4 rounded-lg"
              >
                <Image
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1 ml-6 w-full text-right">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p>المقاس: {item.size}</p>
                  <p>الكمية: {item.quantity}</p>
                  <p className="text-blue-600 font-bold mt-1">
                    السعر: {item.price} ج.م
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="mt-4 md:mt-0 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>

          <div className="text-right mt-8">
            <p className="text-xl font-bold">
              الإجمالي: <span className="text-green-600">{getTotal()} ج.م</span>
            </p>
            <button className="mt-4 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
              إتمام الطلب
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
