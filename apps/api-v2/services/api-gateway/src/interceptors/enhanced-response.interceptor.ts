import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import * as requestIp from 'request-ip';
import * as geoip from 'geoip-lite';
import * as useragent from 'useragent';

// Debug interfaces (for server-side logging)
interface DebugClientInfo {
  ip: string;
  userAgent: {
    browser: string;
    version: string;
    os: string;
    platform: string;
    source: string;
  };
  device: {
    isMobile: boolean;
    isDesktop: boolean;
    isBot: boolean;
  };
  geo?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    coordinates?: [number, number];
  };
}

interface DebugRequestInfo {
  timestamp: string;
  requestId: string;
  correlationId: string;
  method: string;
  path: string;
  fullUrl: string;
  timeElapsed: string;
  statusCode: number;
  client: DebugClientInfo;
  environment: string;
  apiVersion: string;
}

// Client response interfaces
interface ApiResponse<T> {
  data: T;
}

@Injectable()
export class EnhancedResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  private readonly startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const requestStartTime = Date.now();

    return next.handle().pipe(
      map((data: T) => {
        // Collect debug information
        const debugInfo = this.collectDebugInfo(
          request,
          response,
          requestStartTime,
        );

        // Log debug information to console
        this.logDebugInfo(debugInfo);

        // Only return the data to the client
        return { data } satisfies ApiResponse<T>;
      }),
    );
  }

  private collectDebugInfo(
    request: Request,
    response: Response,
    startTime: number,
  ): DebugRequestInfo {
    const clientInfo = this.getClientInfo(request);
    const timeElapsed = `${String(Date.now() - startTime)}ms`;

    const host = request.get('host') ?? 'unknown';

    return {
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      correlationId: request.get('X-Correlation-ID') ?? 'not-set',
      method: request.method,
      path: request.path,
      fullUrl: `${request.protocol}://${host}${request.originalUrl}`,
      timeElapsed,
      statusCode: response.statusCode,
      client: clientInfo,
      environment: process.env.NODE_ENV ?? 'development',
      apiVersion: process.env.API_VERSION ?? '1.0',
    };
  }

  private getClientInfo(request: Request): DebugClientInfo {
    const ip = requestIp.getClientIp(request) ?? 'unknown';
    const userAgentString = request.get('user-agent') ?? '';
    const agent = useragent.parse(userAgentString);
    const geo = this.getGeoLocation(ip);

    return {
      ip,
      userAgent: {
        browser: agent.family,
        version: agent.toVersion(),
        os: agent.os.toString(),
        platform: agent.device.family,
        source: userAgentString,
      },
      device: {
        isMobile: this.isMobileDevice(userAgentString),
        isDesktop: this.isDesktopDevice(userAgentString),
        isBot: this.isBot(userAgentString),
      },
      geo,
    };
  }

  private getGeoLocation(ip: string) {
    try {
      if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
        return undefined;
      }

      const geo = geoip.lookup(ip);
      if (!geo) return undefined;

      return {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        timezone: geo.timezone,
        coordinates: geo.ll,
      };
    } catch (error) {
      console.error('Error getting geolocation:', error);
      return undefined;
    }
  }

  private logDebugInfo(debugInfo: DebugRequestInfo): void {
    const { client, ...requestInfo } = debugInfo;

    console.log(`🌐 ${requestInfo.path}`);
    console.table({
      timestamp: requestInfo.timestamp,
      requestId: requestInfo.requestId,
      method: requestInfo.method,
      statusCode: requestInfo.statusCode,
      timeElapsed: requestInfo.timeElapsed,
    });

    const getDeviceType = (device: { isMobile: boolean; isBot: boolean }) => {
      if (device.isMobile) return 'Mobile';
      if (device.isBot) return 'Bot';
      return 'Desktop';
    };

    const deviceType = getDeviceType(client.device);

    if (
      client.ip !== 'unknown' &&
      client.ip !== '127.0.0.1' &&
      client.ip !== '::1' &&
      client.ip !== '::ffff:127.0.0.1'
    ) {
      console.log('\n👤 Client Information:');
      console.table({
        ip: client.ip,
        browser: `${client.userAgent.browser} ${client.userAgent.version}`,
        os: client.userAgent.os,
        platform: client.userAgent.platform,
        deviceType,
      });
    }

    if (client.geo) {
      console.log('\n📍 Location Information:');
      console.table({
        country: client.geo.country,
        city: client.geo.city,
        region: client.geo.region,
        timezone: client.geo.timezone,
      });
    }
  }

  private isMobileDevice(userAgent: string): boolean {
    return /Mobile|Android|iP(?:hone|od|ad)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(?:hpw|web)OS|Opera M(?:obi|ini)/.test(
      userAgent,
    );
  }

  private isDesktopDevice(userAgent: string): boolean {
    return !this.isMobileDevice(userAgent) && !this.isBot(userAgent);
  }

  private isBot(userAgent: string): boolean {
    return /bot|crawler|spider|crawling|Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot/i.test(
      userAgent,
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now().toString()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
