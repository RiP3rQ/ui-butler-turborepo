export interface MetricLabels {
  [key: string]: string;
}

export interface HttpMetricLabels extends MetricLabels {
  method: string;
  route: string;
  status: string;
}

export interface GrpcMetricLabels extends MetricLabels {
  service: string;
  method: string;
  status: string;
}

export class MetricError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'MetricError';
  }
}
