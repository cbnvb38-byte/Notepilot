"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, ThumbsUp, Trash2, CheckCircle2, Edit2, AlertCircle, Filter, X, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitRating, removeRating, toggleHelpfulVote, getReviewsForNote, reportReview, ReviewFilterOptions } from "@/app/actions/ratings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_title: string | null;
  review_text: string | null;
  is_verified_downloader: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  isHelpfulByMe: boolean;
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export function ReviewsSection({
  noteId,
  isAuthor,
  averageRating,
  ratingCount,
  totalReviews,
  distribution,
  initialUserRating,
  initialUserReviewTitle,
  initialUserReviewText,
  onRatingUpdate
}: {
  noteId: string;
  isAuthor: boolean;
  averageRating: number;
  ratingCount: number;
  totalReviews: number;
  distribution: Record<number, number>;
  initialUserRating: number;
  initialUserReviewTitle: string;
  initialUserReviewText: string;
  onRatingUpdate: (avg: number, count: number, totalRevs: number, dist: Record<number, number>) => void;
}) {
  const { userId } = useAuth();
  const [userRating, setUserRating] = useState(initialUserRating);
  const [userReviewTitle, setUserReviewTitle] = useState(initialUserReviewTitle ?? "");
  const [userReviewText, setUserReviewText] = useState(initialUserReviewText ?? "");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(initialUserReviewText !== "" || initialUserReviewTitle !== "");
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  
  const [filters, setFilters] = useState<ReviewFilterOptions>({
    sortBy: "helpful",
    page: 1,
    limit: 10
  });

  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const loadReviews = async (opts: ReviewFilterOptions = filters, append = false) => {
    try {
      setIsLoadingReviews(true);
      const res = await getReviewsForNote(noteId, opts);
      if (res.success && "data" in res && res.data) {
        if (append) {
          setReviews(prev => [...prev, ...res.data.reviews]);
        } else {
          setReviews(res.data.reviews);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadReviews(filters);
  }, [filters.sortBy, filters.star, filters.writtenOnly, filters.verifiedOnly]);

  const handleStarClick = async (star: number) => {
    if (isAuthor || isSubmitting) return;
    
    setIsSubmitting(true);
    const prev = userRating;
    setUserRating(star);
    try {
      const res = await submitRating(noteId, star, userReviewTitle.trim() || null, userReviewText.trim() || null);
      if (res.success && "data" in res && res.data) {
        onRatingUpdate(res.data.averageRating, res.data.ratingCount, res.data.totalReviews, res.data.distribution);
        toast.success(prev === 0 ? "Rating saved" : "Rating updated");
        if (prev === 0) setShowReviewForm(true); // Encourage writing a review
        loadReviews(filters, false); // Reload reviews
      } else {
        setUserRating(prev);
        toast.error("Failed to save rating");
      }
    } catch (e) {
      setUserRating(prev);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (isAuthor || isSubmitting || userRating === 0) return;
    setIsSubmitting(true);
    try {
      const res = await submitRating(noteId, userRating, userReviewTitle.trim() || null, userReviewText.trim() || null);
      if (res.success && "data" in res && res.data) {
        onRatingUpdate(res.data.averageRating, res.data.ratingCount, res.data.totalReviews, res.data.distribution);
        toast.success("Review submitted");
        loadReviews(filters, false);
      } else {
        toast.error("Failed to submit review");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveRating = async () => {
    if (isAuthor || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await removeRating(noteId);
      if (res.success && "data" in res && res.data) {
        setUserRating(0);
        setUserReviewTitle("");
        setUserReviewText("");
        setShowReviewForm(false);
        onRatingUpdate(res.data.averageRating, res.data.ratingCount, res.data.totalReviews, res.data.distribution);
        toast.success("Rating and review removed");
        loadReviews(filters, false);
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    console.log("[Client] handleHelpful started, reviewId:", reviewId);
    try {
      const res = await toggleHelpfulVote(reviewId);
      console.log("[Client] toggleHelpfulVote response:", res);
      if (res.success && "isHelpful" in res) {
        setReviews(prev => prev.map(r => {
          if (r.id === reviewId) {
            return {
              ...r,
              isHelpfulByMe: res.isHelpful as boolean,
              helpful_count: r.helpful_count + (res.isHelpful ? 1 : -1)
            };
          }
          return r;
        }));
      } else {
        toast.error((res as any).error?.message || "Failed to vote");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    }
  };

  const handleReportSubmit = async () => {
    console.log("[Client] handleReportSubmit started. Reason:", reportReason, "ReviewID:", reportingReviewId);
    if (!reportingReviewId || isReporting) return;
    setIsReporting(true);
    try {
      const res = await reportReview(reportingReviewId, reportReason, reportDetails);
      console.log("[Client] reportReview response:", res);
      if (res.success) {
        toast.success("Review reported successfully");
        setReportingReviewId(null);
        setReportReason("Spam");
        setReportDetails("");
      } else {
        toast.error((res as any).error?.message || "Failed to report review");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsReporting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            disabled={!interactive || isAuthor || isSubmitting}
            onClick={() => interactive && handleStarClick(star)}
            className={`${interactive && !isAuthor ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star 
              className={`h-5 w-5 ${
                rating >= star 
                  ? "text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" 
                  : "text-zinc-700 fill-zinc-800/50"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full mt-12 flex flex-col gap-10">
      <div className="border-t border-zinc-800/60 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Rating Summary (Left Column) */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-3">Customer Reviews</h2>
            <div className="flex items-center gap-4">
              {renderStars(Math.round(averageRating))}
              <span className="text-xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">{averageRating.toFixed(1)} out of 5</span>
            </div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2">{ratingCount} global ratings</p>
          </div>
          
          <div className="flex flex-col gap-4">
            {[5, 4, 3, 2, 1].map(star => {
              const count = distribution[star] || 0;
              const pct = ratingCount > 0 ? Math.round((count / ratingCount) * 100) : 0;
              return (
                <button 
                  key={star}
                  onClick={() => setFilters(f => ({ ...f, star: f.star === star ? undefined : star, page: 1 }))}
                  className="flex items-center gap-3 text-sm group"
                >
                  <span className="w-14 text-zinc-500 font-bold group-hover:text-yellow-400 transition-colors uppercase tracking-widest text-[10px]">{star} star</span>
                  <div className="flex-1 h-2.5 bg-zinc-900 border border-zinc-800/80 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-zinc-400 font-black text-xs">{pct}%</span>
                </button>
              );
            })}
          </div>
          
          <div className="mt-2 pt-8 border-t border-zinc-800/60">
            <h3 className="font-black text-lg text-white mb-2 tracking-tight">Review this note</h3>
            <p className="text-sm text-zinc-400 mb-6 font-medium">Share your thoughts with other students.</p>
            {isAuthor ? (
               <p className="text-sm text-red-400 flex items-center gap-2 font-bold"><AlertCircle className="w-4 h-4" /> You cannot rate your own note.</p>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800/80 p-4 rounded-2xl shadow-inner">
                  {renderStars(userRating, true)}
                  {userRating > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleRemoveRating} className="text-red-400 font-bold hover:text-red-300 hover:bg-red-500/10 h-8 rounded-xl px-4 uppercase tracking-widest text-[10px]">
                      Clear
                    </Button>
                  )}
                </div>
                {userRating > 0 && !showReviewForm && (
                  <Button variant="outline" className="w-full bg-zinc-950 border border-zinc-800/80 hover:bg-zinc-900 text-white font-black h-12 rounded-xl shadow-xl transition-all" onClick={() => setShowReviewForm(true)}>
                    Write a review
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Review Form & List (Right Column) */}
        <div className="md:col-span-2 flex flex-col gap-8">
          
          {/* Write Review Form */}
          {showReviewForm && !isAuthor && (
            <div className="godmode-card bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/80 p-5 sm:p-6 rounded-2xl flex flex-col gap-5 relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
              <h3 className="font-black text-lg text-white tracking-tight ml-2">Write a Review</h3>
              
              <div className="flex flex-col gap-3 ml-0 sm:ml-2">
                <Input 
                  placeholder="Review Title (e.g., Extremely helpful for midterms!)" 
                  value={userReviewTitle ?? ""}
                  onChange={e => setUserReviewTitle(e.target.value.substring(0, 100))}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-2 focus-visible:ring-yellow-500/20 focus-visible:border-yellow-500/50 rounded-xl h-12 px-4 shadow-inner font-medium w-full"
                />
                <Textarea 
                  placeholder="What did you like or dislike? What should other students know before downloading?"
                  value={userReviewText ?? ""}
                  onChange={e => setUserReviewText(e.target.value.substring(0, 1000))}
                  className="bg-zinc-900 border-zinc-800 text-white min-h-[140px] resize-none focus-visible:ring-2 focus-visible:ring-yellow-500/20 focus-visible:border-yellow-500/50 rounded-xl p-4 shadow-inner font-medium w-full"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 ml-0 sm:ml-2">
                <Button variant="ghost" onClick={() => setShowReviewForm(false)} className="w-full sm:w-auto text-zinc-400 hover:text-white font-bold h-12 sm:h-10 px-6 rounded-xl hover:bg-zinc-900">
                  Cancel
                </Button>
                <Button 
                  onClick={handleReviewSubmit}
                  disabled={isSubmitting || userRating === 0}
                  className="w-full sm:w-auto glow-border bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-yellow-950 font-black h-12 sm:h-10 px-8 rounded-xl shadow-xl shadow-yellow-500/20 transition-all"
                >
                  {initialUserReviewText ? "Update Review" : "Submit Review"}
                </Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-zinc-800/60">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Filter className="w-4 h-4" /> Filter by:</span>
            {filters.star && (
              <span className="bg-yellow-500/10 text-yellow-400 text-xs px-3 py-1 rounded-md flex items-center gap-1.5 font-black uppercase tracking-widest border border-yellow-500/20 shadow-inner">
                {filters.star} Stars
                <button onClick={() => setFilters(f => ({ ...f, star: undefined, page: 1 }))}><X className="w-3.5 h-3.5 hover:text-yellow-300 transition-colors" /></button>
              </span>
            )}
            
            <select 
              value={filters.sortBy}
              onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as any, page: 1 }))}
              className="bg-zinc-950 border border-zinc-800/80 text-zinc-300 text-sm font-semibold rounded-xl px-4 py-2 outline-none focus:border-zinc-600 shadow-inner"
            >
              <option value="helpful">Top Reviews</option>
              <option value="recent">Most Recent</option>
              <option value="high">Positive First</option>
              <option value="low">Critical First</option>
            </select>
          </div>

          {/* Reviews List */}
          <div className="flex flex-col gap-6">
            {isLoadingReviews && reviews.length === 0 ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>
            ) : reviews.length > 0 ? (
              reviews.filter(r => r.review_text || r.review_title).map(review => (
                <div key={review.id} className="flex flex-col gap-3 pb-8 border-b border-zinc-800/60 last:border-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-zinc-800 shadow-md">
                      <AvatarImage src={review.profiles?.avatar_url || ""} />
                      <AvatarFallback className="bg-zinc-900 text-xs text-zinc-400 font-bold">
                        {review.profiles?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-black text-zinc-200">
                      {review.user_id ? (
                        <Link 
                          href={`/contributors/${review.user_id}`}
                          className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                        >
                          {review.profiles?.name || "Anonymous Student"}
                        </Link>
                      ) : (
                        review.profiles?.name || "Anonymous Student"
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    {renderStars(review.rating)}
                    {review.review_title && <span className="font-black text-white text-base tracking-tight">{review.review_title}</span>}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Reviewed on {new Date(review.created_at).toLocaleDateString()}</span>
                    {review.is_verified_downloader && (
                      <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shadow-inner">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Downloader
                      </span>
                    )}
                    {review.created_at !== review.updated_at && <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">(Edited)</span>}
                  </div>
                  
                  {review.review_text && (
                    <p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap leading-relaxed font-medium">{review.review_text}</p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-4">
                    <button 
                      onClick={() => handleHelpful(review.id)}
                      disabled={!userId || review.user_id === userId}
                      className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border ${
                        review.isHelpfulByMe 
                          ? "bg-zinc-800 text-white border-zinc-700 shadow-md" 
                          : "bg-zinc-950 text-zinc-400 border-zinc-800/80 hover:border-zinc-600 hover:text-zinc-200 shadow-inner"
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${review.isHelpfulByMe ? "fill-white text-white" : ""}`} />
                      Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
                    </button>
                    
                    <button 
                      onClick={() => setReportingReviewId(review.id)}
                      disabled={!userId || review.user_id === userId}
                      className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 px-3 py-2 disabled:opacity-50 transition-colors"
                    >
                      Report
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 flex flex-col items-center gap-4 border border-dashed border-zinc-800/60 rounded-2xl bg-zinc-950/50">
                <MessageSquare className="w-12 h-12 text-zinc-800" />
                <p className="text-zinc-500 text-sm font-bold">No written reviews yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!reportingReviewId} onOpenChange={(open) => !open && setReportingReviewId(null)}>
        <DialogContent className="godmode-card bg-zinc-950 border-zinc-800/80 text-zinc-50 sm:max-w-md shadow-[0_15px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          <DialogHeader className="border-b border-zinc-800/60 pb-4">
            <DialogTitle className="text-lg font-black text-red-400">Report Review</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 font-medium mt-1">
              Please select a reason for reporting this review.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-5">
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm font-medium rounded-xl px-4 py-3 outline-none focus:border-zinc-600 shadow-inner"
            >
              <option value="Spam">Spam</option>
              <option value="Abuse">Abuse</option>
              <option value="Irrelevant content">Irrelevant content</option>
              <option value="Offensive language">Offensive language</option>
              <option value="False or misleading information">False or misleading information</option>
              <option value="Other">Other</option>
            </select>
            
            {reportReason === "Other" && (
              <Textarea 
                placeholder="Please provide details..."
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value.substring(0, 500))}
                className="bg-zinc-900 border-zinc-800 text-white min-h-[120px] resize-none focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:border-red-500/50 rounded-xl p-4 shadow-inner"
              />
            )}
          </div>
          
          <DialogFooter className="border-t border-zinc-800/60 pt-4">
            <Button variant="ghost" onClick={() => setReportingReviewId(null)} className="text-zinc-400 hover:text-white font-bold h-10 px-6 rounded-xl hover:bg-zinc-900">
              Cancel
            </Button>
            <Button 
              onClick={handleReportSubmit}
              disabled={isReporting || (reportReason === "Other" && !reportDetails.trim())}
              className="bg-red-600 hover:bg-red-500 text-white font-black h-10 px-6 rounded-xl shadow-xl shadow-red-500/20 disabled:opacity-50 transition-all"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
