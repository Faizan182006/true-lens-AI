export interface SampleMediaItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  description: string;
  expectedCategory: 'Likely AI-generated' | 'Likely authentic';
  url: string;
  sourceNote: string;
}

export const SAMPLE_MEDIA: SampleMediaItem[] = [
  {
    id: 'sample-ai-portrait',
    title: 'Synthetic Neon Portrait',
    type: 'image',
    description: 'Hyper-detailed digital portrait with subtle skin diffusion waxy texture and complex hair strands.',
    expectedCategory: 'Likely AI-generated',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    sourceNote: 'Generative AI visual pattern test',
  },
  {
    id: 'sample-real-mountain',
    title: 'Alpine Glacial Lake (Real Photography)',
    type: 'image',
    description: 'High-altitude authentic landscape with natural organic geological grain, accurate refraction, and physical sunlight.',
    expectedCategory: 'Likely authentic',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    sourceNote: 'Canon EOS 5D Mark IV authentic raw capture',
  },
  {
    id: 'sample-ai-architecture',
    title: 'Impossible Floating Pavilion',
    type: 'image',
    description: 'Organic architectural structure featuring paradoxical perspective convergence and impossible load-bearing physics.',
    expectedCategory: 'Likely AI-generated',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    sourceNote: 'Conceptual generative architecture rendering',
  },
  {
    id: 'sample-real-street',
    title: 'Rainy Tokyo Crosswalk (Real Photography)',
    type: 'image',
    description: 'Real-world street capture with complex natural puddle reflections, legitimate signage typography, and camera sensor noise.',
    expectedCategory: 'Likely authentic',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
    sourceNote: 'Sony A7R III documentary street photography',
  },
];
