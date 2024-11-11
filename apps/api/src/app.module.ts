import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { WorkflowExecutionsModule } from './workflow-executions/workflow-executions.module';
import { CredentialsModule } from './credentials/credentials.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UsersModule, AuthModule, AnalyticsModule, WorkflowsModule, WorkflowExecutionsModule, CredentialsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
