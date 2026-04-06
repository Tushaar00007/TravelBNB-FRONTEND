import { useState, useEffect } from "react";
import { Star, Trash2 } from "lucide-react";

// Helper function to format timestamp beautifully
const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMins < 60) return `${diffInMins} minute${diffInMins !== 1 ? 's' : ''}`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 30) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''}`;
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''}`;
};

function ReviewCard({ review, currentUserId, onDelete }) {
    // Force a re-render every minute to keep time fresh
    const [, setTick] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTick(t => t + 1);
        }, 60000); // Update every 1 minute

        return () => clearInterval(intervalId);
    }, []);

    const isOwner = currentUserId && review.userId === currentUserId;

    // Create a 5-star array visual representation
    const stars = Array(5).fill(0).map((_, index) => (
        <Star
            key={index}
            size={14}
            className={index < review.rating ? "fill-orange-500 text-orange-500" : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"}
        />
    ));

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold text-orange-600 shadow-sm overflow-hidden">
                        {review.user?.profileImage ? (
                            <img src={review.user.profileImage} alt={review.user.firstName} className="w-full h-full object-cover" />
                        ) : (
                            review.user?.firstName?.charAt(0).toUpperCase() || "U"
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white capitalize">
                            {review.user?.firstName || "Unknown User"} {review.user?.lastName || ""}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {formatShortDate(review.createdAt)}
                        </p>
                    </div>
                </div>

                {isOwner && onDelete && (
                    <button
                        onClick={() => onDelete(review._id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-colors"
                        title="Delete your review"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-1 mb-3">
                {stars}
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mt-auto whitespace-pre-wrap">
                {review.comment}
            </p>
        </div>
    );
}

export default ReviewCard;
