'use client';

import { useState, useEffect } from 'react';
import type { Cafe } from '@/lib/types';

interface CafeEditorProps {
  cafeId: number;
}

export function CafeEditor({ cafeId }: CafeEditorProps) {
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCafe() {
      try {
        const response = await fetch(`/api/cafes/${cafeId}`);
        if (response.ok) {
          const data = await response.json();
          setCafe(data);
        }
      } catch (error) {
        console.error('Error fetching cafe:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCafe();
  }, [cafeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cafe) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/cafes/${cafeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: cafe.name,
          address: cafe.address,
          description: cafe.description,
          num_pcs: cafe.num_pcs,
          gpu_specs: cafe.gpu_specs,
          cpu_specs: cafe.cpu_specs,
          ram_specs: cafe.ram_specs,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cafe');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cafe');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading café details...</p>
      </div>
    );
  }

  if (!cafe) {
    return <div className="card p-8 text-center text-gray-400">Café not found</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">
        Edit Café Profile
      </h2>

      {success && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-lg">
          <p className="text-green-300 font-medium">
            ✓ Café profile updated successfully!
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/50 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="label">
              Café Name *
            </label>
            <input
              id="name"
              type="text"
              required
              className="input"
              value={cafe.name}
              onChange={(e) => setCafe({ ...cafe, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="num_pcs" className="label">
              Number of PCs *
            </label>
            <input
              id="num_pcs"
              type="number"
              required
              min="1"
              className="input"
              value={cafe.num_pcs}
              onChange={(e) =>
                setCafe({ ...cafe, num_pcs: parseInt(e.target.value) })
              }
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="label">
            Address *
          </label>
          <input
            id="address"
            type="text"
            required
            className="input"
            value={cafe.address}
            onChange={(e) => setCafe({ ...cafe, address: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="input"
            value={cafe.description || ''}
            onChange={(e) => setCafe({ ...cafe, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="gpu_specs" className="label">
              GPU Specs *
            </label>
            <input
              id="gpu_specs"
              type="text"
              required
              className="input"
              placeholder="e.g., NVIDIA RTX 4080"
              value={cafe.gpu_specs}
              onChange={(e) => setCafe({ ...cafe, gpu_specs: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="cpu_specs" className="label">
              CPU Specs
            </label>
            <input
              id="cpu_specs"
              type="text"
              className="input"
              placeholder="e.g., Intel Core i9-13900K"
              value={cafe.cpu_specs || ''}
              onChange={(e) => setCafe({ ...cafe, cpu_specs: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="ram_specs" className="label">
              RAM Specs
            </label>
            <input
              id="ram_specs"
              type="text"
              className="input"
              placeholder="e.g., 32GB DDR5"
              value={cafe.ram_specs || ''}
              onChange={(e) => setCafe({ ...cafe, ram_specs: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

