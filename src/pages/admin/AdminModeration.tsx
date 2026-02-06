import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Flag, Search, Star, MessageSquare, CheckCircle, XCircle,
  AlertTriangle, Eye, Trash2, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  is_verified: boolean | null;
  created_at: string;
  center_id: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
  };
  centers?: {
    name: string;
  };
}

export default function AdminModeration() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Review | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews', searchQuery],
    queryFn: async () => {
      // First get reviews
      let reviewsQuery = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        reviewsQuery = reviewsQuery.ilike('comment', `%${searchQuery}%`);
      }

      const { data: reviewsData, error: reviewsError } = await reviewsQuery;
      if (reviewsError) throw reviewsError;

      // Get unique center IDs and user IDs
      const centerIds = [...new Set((reviewsData || []).map(r => r.center_id))];
      const userIds = [...new Set((reviewsData || []).map(r => r.user_id))];

      // Fetch centers and profiles in parallel
      const [centersRes, profilesRes] = await Promise.all([
        supabase.from('centers').select('id, name').in('id', centerIds),
        supabase.from('profiles').select('user_id, full_name').in('user_id', userIds),
      ]);

      const centersMap = new Map((centersRes.data || []).map(c => [c.id, c]));
      const profilesMap = new Map((profilesRes.data || []).map(p => [p.user_id, p]));

      return (reviewsData || []).map(review => ({
        ...review,
        centers: centersMap.get(review.center_id),
        profiles: profilesMap.get(review.user_id),
      })) as Review[];
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: 'Review deleted' });
      setDeleteDialog(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const verifyReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_verified: true })
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: 'Review verified' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const lowRatingReviews = reviews?.filter(r => r.rating <= 2) || [];
  const unverifiedReviews = reviews?.filter(r => !r.is_verified) || [];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-secondary fill-secondary' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review, index }: { review: Review; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass-card p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {renderStars(review.rating)}
            {!review.is_verified && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                Unverified
              </Badge>
            )}
            {review.rating <= 2 && (
              <Badge variant="destructive">Low Rating</Badge>
            )}
          </div>
          
          <p className="text-sm mb-2 line-clamp-2">
            {review.comment || <span className="text-muted-foreground italic">No comment</span>}
          </p>
          
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>By: {review.profiles?.full_name || 'Anonymous'}</span>
            <span>Center: {review.centers?.name || 'Unknown'}</span>
            <span>{new Date(review.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedReview(review)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {!review.is_verified && (
              <DropdownMenuItem onClick={() => verifyReviewMutation.mutate(review.id)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Verified
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => setDeleteDialog(review)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Review
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">Review and moderate user-generated content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-xl font-bold">{reviews?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unverified</p>
              <p className="text-xl font-bold">{unverifiedReviews.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Flag className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Ratings</p>
              <p className="text-xl font-bold">{lowRatingReviews.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search reviews..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="unverified">
            Unverified ({unverifiedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="low-rating">
            Low Rating ({lowRatingReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-48 mb-2" />
                  <div className="h-3 bg-muted rounded w-32" />
                </div>
              ))}
            </div>
          ) : reviews?.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reviews found</p>
            </div>
          ) : (
            reviews?.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))
          )}
        </TabsContent>

        <TabsContent value="unverified" className="mt-4 space-y-3">
          {unverifiedReviews.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">All reviews are verified</p>
            </div>
          ) : (
            unverifiedReviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))
          )}
        </TabsContent>

        <TabsContent value="low-rating" className="mt-4 space-y-3">
          {lowRatingReviews.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Star className="w-12 h-12 mx-auto text-secondary mb-4" />
              <p className="text-muted-foreground">No low-rating reviews</p>
            </div>
          ) : (
            lowRatingReviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>Full review information</DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {renderStars(selectedReview.rating)}
                <span className="text-sm text-muted-foreground">
                  ({selectedReview.rating}/5)
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Comment</p>
                <p>{selectedReview.comment || 'No comment provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reviewer</p>
                  <p className="font-medium">{selectedReview.profiles?.full_name || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Center</p>
                  <p className="font-medium">{selectedReview.centers?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedReview.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {selectedReview.is_verified ? (
                      <span className="text-primary">Verified</span>
                    ) : (
                      <span className="text-amber-500">Unverified</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && deleteReviewMutation.mutate(deleteDialog.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
