import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, ReviewResponse } from '../../services/review.service';
import { shopService } from '../../services/shop.service';
import { Star, MessageCircle, Send, Filter, Calendar, User, CheckCircle2, Reply } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function ShopReviews() {
  const queryClient = useQueryClient();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // 1. Get My Shop Info
  const { data: shop } = useQuery({
    queryKey: ['my-shop'],
    queryFn: () => shopService.getMyShop(),
  });

  // 2. Get Reviews for this shop
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['shop-reviews-owner', shop?.id],
    queryFn: () => reviewService.getReviewsByShop(shop!.id),
    enabled: !!shop?.id,
  });

  // 3. Mutation for replying
  const replyMutation = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => reviewService.replyToReview(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-reviews-owner'] });
      setReplyingTo(null);
      setReplyText('');
      toast.success('Đã gửi phản hồi thành công!');
    },
    onError: () => {
      toast.error('Gửi phản hồi thất bại. Vui lòng thử lại.');
    }
  });

  const handleReplySubmit = (reviewId: number) => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ id: reviewId, text: replyText });
  };

  const filteredReviews = reviews.filter(r => filterRating === 'all' || r.rating === filterRating);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Star className="w-8 h-8 text-blue-600" />
            Quản lý Đánh giá
            <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
              {reviews.length} Phản hồi
            </div>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Xem và phản hồi lại những đánh giá từ khách hàng của bạn.</p>
        </div>

        {/* Rating Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-center gap-8">
          <div className="text-center">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{shop?.ratingAvg?.toFixed(1) || '0.0'}</span>
            <div className="flex text-amber-400 justify-center mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} fill={s <= Math.round(shop?.ratingAvg || 0) ? "currentColor" : "none"} />
              ))}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Điểm trung bình</p>
          </div>
          <div className="w-px h-12 bg-slate-100 dark:bg-slate-800" />
          <div className="flex flex-col gap-1">
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 w-3">{star}</span>
                  <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          onClick={() => setFilterRating('all')}
          className={`px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all ${
            filterRating === 'all'
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          Tất cả
        </button>
        {[5, 4, 3, 2, 1].map(star => (
          <button
            key={star}
            onClick={() => setFilterRating(star)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all ${
              filterRating === star
                ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20'
                : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-amber-200'
            }`}
          >
            {star} <Star size={14} fill={filterRating === star ? "currentColor" : "none"} />
          </button>
        ))}
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-16 text-center border border-slate-100 dark:border-slate-800 border-dashed">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Star size={40} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Chưa có đánh giá nào</h3>
            <p className="text-slate-500 mt-2">Những đánh giá từ khách hàng sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          filteredReviews.map((review, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={review.id}
              className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* User Info */}
                <div className="flex items-start gap-4 md:w-48 shrink-0">
                  <div className="relative">
                    <img
                      src={review.userAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'}
                      alt={review.userName}
                      className="w-14 h-14 rounded-2xl object-cover ring-4 ring-slate-50 dark:ring-slate-800"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-lg border-2 border-white dark:border-slate-900 flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[120px]">{review.userName}</h4>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        <Calendar size={10} />
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      {review.serviceName && (
                        <div className="text-[10px] font-black text-indigo-500 truncate max-w-[120px] uppercase tracking-tighter">
                          #{review.serviceName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={16} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-800'} />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
                    {review.comment}
                  </p>

                  {/* Owner Reply Area */}
                  <div className="mt-8">
                    {review.reply ? (
                      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group/reply">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-[0.2em]">
                            <Reply size={14} /> Phản hồi từ Shop
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(review.repliedAt!).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed italic">
                          "{review.reply}"
                        </p>
                        <button 
                          onClick={() => {
                            setReplyingTo(review.id);
                            setReplyText(review.reply!);
                          }}
                          className="absolute top-4 right-4 opacity-0 group-hover/reply:opacity-100 transition-opacity text-[11px] font-bold text-primary hover:underline"
                        >
                          Chỉnh sửa
                        </button>
                      </div>
                    ) : replyingTo === review.id ? (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-primary/5 rounded-3xl p-6 border border-primary/20"
                      >
                        <div className="flex items-center gap-2 mb-4 text-primary font-black text-[11px] uppercase tracking-wider">
                          <MessageCircle size={16} /> Viết phản hồi của bạn
                        </div>
                        <textarea
                          autoFocus
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Cảm ơn khách hàng hoặc giải đáp thắc mắc của họ..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px] resize-none"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="px-6 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            disabled={replyMutation.isPending || !replyText.trim()}
                            onClick={() => handleReplySubmit(review.id)}
                            className="flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-xl text-[13px] font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50"
                          >
                            {replyMutation.isPending ? 'Đang gửi...' : 'Gửi phản hồi'}
                            {!replyMutation.isPending && <Send size={14} />}
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(review.id)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 rounded-2xl text-[13px] font-bold hover:bg-primary hover:text-white transition-all group/btn"
                      >
                        <MessageCircle size={16} className="group-hover/btn:scale-110 transition-transform" />
                        Viết phản hồi ngay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
