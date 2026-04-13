import { useSearchParams } from 'react-router-dom';
import { TIERS, CATEGORIES } from '../../data/categories';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function FilterSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTier, setSelectedTier] = useState(searchParams.get('tier') || '');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    if (selectedTier) {
      setCategories(CATEGORIES.filter(c => c.tier_slug === selectedTier));
    } else {
      setCategories([]);
    }
  }, [selectedTier]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Clear dependent filters
    if (key === 'tier') {
      params.delete('category');
      params.delete('subcategory');
    }
    if (key === 'category') {
      params.delete('subcategory');
    }
    setSearchParams(params);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>
      
      {/* Tier Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Service Tier</label>
        <select
          value={selectedTier}
          onChange={(e) => {
            setSelectedTier(e.target.value);
            updateParams('tier', e.target.value);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Tiers</option>
          {TIERS.map(tier => (
            <option key={tier.slug} value={tier.slug}>{tier.name}</option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      {selectedTier && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              updateParams('category', e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range (placeholder) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min ₦" className="w-1/2 px-2 py-1 border rounded" />
          <input type="number" placeholder="Max ₦" className="w-1/2 px-2 py-1 border rounded" />
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option value="">Any</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
        </select>
      </div>

      <button
        onClick={() => {
          setSearchParams({});
          setSelectedTier('');
          setSelectedCategory('');
        }}
        className="w-full py-2 text-sm text-primary-600 hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}