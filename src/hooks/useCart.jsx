// src/hooks/useCart.js
import { useState } from 'react';
import { supabase } from '../supabaseClient';

export const useCart = () => {
  const [loading, setLoading] = useState(false);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      // get current user session
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const user = session?.user;

      if (user) {
        // 1️⃣ Check for existing cart_item
        const { data: existing, error: selectError } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          // code PGRST116 = no rows found
          throw selectError;
        }

        if (existing) {
          // 2️⃣ Update existing
          const { error: updErr } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('id', existing.id);

          if (updErr) throw updErr;
        } else {
          // 3️⃣ Insert new
          const { error: insErr } = await supabase
            .from('cart_items')
            .insert([{ user_id: user.id, product_id: productId, quantity }]);

          if (insErr) throw insErr;
        }

        alert('✅ Added to your cart!');
      } else {
        // Guest user → sessionStorage
        const guestCart = JSON.parse(sessionStorage.getItem('guest_cart')) || [];
        const idx = guestCart.findIndex(i => i.productId === productId);

        if (idx > -1) {
          guestCart[idx].quantity += quantity;
        } else {
          guestCart.push({ productId, quantity });
        }
        sessionStorage.setItem('guest_cart', JSON.stringify(guestCart));
        alert('✅ Added to guest cart!');
      }
    } catch (err) {
      console.error('🚨 Cart error:', err);
      alert(`❌ Failed to add to cart: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return { addToCart, loading };
};
