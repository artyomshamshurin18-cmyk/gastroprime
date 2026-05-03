import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { DriverGuard } from '../common/driver.guard';

@Module({
  controllers: [DriverController],
  providers: [DriverService, DriverGuard],
})
export class DriverModule {}
