import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { WorkflowExecutionsModule } from './workflow-executions/workflow-executions.module';
import { CredentialsModule } from './credentials/credentials.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';
import { LoggerModule } from 'nestjs-pino';
import { ProjectsModule } from './projects/projects.module';
import { ComponentsModule } from './components/components.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                  },
                },
            level: isProduction ? 'info' : 'debug',
            serializers: {
              req: (req) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
              }),
              res: (res) => ({
                statusCode: res.statusCode,
              }),
            },
            redact: {
              paths: [
                'req.headers.cookie',
                'req.headers.authorization',
                'req.headers["Authentication"]',
                'req.headers["Refresh"]',
              ],
              remove: true,
            },
            // Fixed version with proper typing
            customProps: (req, res: any) => ({
              responseTime: res.responseTime
                ? `${res.responseTime}`
                : undefined,
            }),
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    AnalyticsModule,
    WorkflowsModule,
    WorkflowExecutionsModule,
    CredentialsModule,
    ProjectsModule,
    ComponentsModule,
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'),
    // }),
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
