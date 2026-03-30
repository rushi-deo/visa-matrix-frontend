import { getHrStore } from "../../shared/repository/hrStore.js";
import { performanceRepository } from "../repository/index.js";

const table = getHrStore();

export const performanceService = {
  async listReviews(query) {
    return performanceRepository.listReviews(query);
  },
  async createReview(payload) {
    return performanceRepository.createReview(payload);
  },
  async getDashboard() {
    const reviews = table.performance_reviews;
    const averageRating =
      reviews.reduce((total, review) => total + review.rating, 0) / Math.max(1, reviews.length);

    const departmentPerformance = reviews.reduce((result, review) => {
      const current = result[review.department] ?? { total: 0, count: 0 };
      current.total += review.rating;
      current.count += 1;
      result[review.department] = current;
      return result;
    }, {});

    return {
      averageRating: Number(averageRating.toFixed(1)),
      completionRate: Number(
        (
          (reviews.filter((review) => review.status === "completed").length / Math.max(1, reviews.length)) *
          100
        ).toFixed(1),
      ),
      departmentPerformance: Object.entries(departmentPerformance).map(([department, value]) => ({
        department,
        rating: Number((value.total / Math.max(1, value.count)).toFixed(1)),
      })),
    };
  },
};

