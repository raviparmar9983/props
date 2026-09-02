import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizePagination } from '../../common/utils/pagination';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(private prisma: PrismaService) {}

  async list(userId: string, query: { isRead?: boolean; page?: number; limit?: number }) {
    const { page, limit } = normalizePagination(query.page, query.limit);
    const where: any = { userId };
    if (query.isRead !== undefined) where.isRead = query.isRead;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data: notifications, meta: { total, page, limit } };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { message: 'All notifications marked as read' };
  }
}
