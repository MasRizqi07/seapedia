import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import sanitizeHtml from 'sanitize-html';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Robust sanitizer using sanitize-html
   */
  private sanitizeHTML(input: string): string {
    if (!input) return '';
    return sanitizeHtml(input, {
      allowedTags: [], // Strip all tags to ensure plain text
      allowedAttributes: {},
    });
  }

  async create(dto: CreateReviewDto) {
    const sanitizedComment = this.sanitizeHTML(dto.comment);

    return this.prisma.review.create({
      data: {
        reviewerName: dto.reviewerName,
        rating: dto.rating,
        comment: sanitizedComment,
      },
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
