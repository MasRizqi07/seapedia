'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Star } from 'lucide-react';
import { api } from '@/lib/api';

type Review = {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      const res = await api.get<{ data: Review[] }>('/api/reviews');
      setReviews(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/reviews', {
        reviewerName: name,
        rating,
        comment,
      });
      toast({ title: 'Review submitted!' });
      setName('');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="container py-12 max-w-5xl mx-auto grid md:grid-cols-[1fr_350px] gap-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-8">Platform Reviews</h1>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-slate-400">No reviews yet. Be the first!</p>
            ) : (
              reviews.map((r) => (
                <Card key={r.id} className="glass border-white/10">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-cyan-400">{r.reviewerName}</CardTitle>
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-current' : 'text-slate-600'}`} />
                        ))}
                      </div>
                    </div>
                    <CardDescription>{new Date(r.createdAt).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{r.comment}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div>
          <Card className="glass border-white/10 sticky top-24">
            <CardHeader>
              <CardTitle className="text-white">Write a Review</CardTitle>
              <CardDescription>Tell us about your experience</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    maxLength={100}
                    className="bg-slate-900 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input 
                    id="rating" 
                    type="number" 
                    min={1} 
                    max={5} 
                    value={rating} 
                    onChange={(e) => setRating(Number(e.target.value))} 
                    required 
                    className="bg-slate-900 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <textarea 
                    id="comment" 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)} 
                    required 
                    maxLength={1000}
                    rows={4}
                    className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
