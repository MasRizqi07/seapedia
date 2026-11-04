import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@seapedia/types';

@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('jobs')
  getAvailableJobs() {
    return this.jobsService.getAvailableJobs();
  }

  @Get('active')
  getActiveJob(@CurrentUser('userId') driverId: string) {
    return this.jobsService.getActiveJob(driverId);
  }

  @Get('jobs/history')
  getJobHistory(@CurrentUser('userId') driverId: string) {
    return this.jobsService.getJobHistory(driverId);
  }

  @Get('earnings')
  getEarnings(@CurrentUser('userId') driverId: string) {
    return this.jobsService.getEarnings(driverId);
  }

  @Get('jobs/:id')
  getJobDetails(@Param('id') id: string) {
    return this.jobsService.getJobDetails(id);
  }

  @Post('jobs/:id/take')
  takeJob(@CurrentUser('userId') driverId: string, @Param('id') jobId: string) {
    return this.jobsService.takeJob(driverId, jobId);
  }

  @Post('jobs/:id/complete')
  completeJob(@CurrentUser('userId') driverId: string, @Param('id') jobId: string) {
    return this.jobsService.completeJob(driverId, jobId);
  }
}
