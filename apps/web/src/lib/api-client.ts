import { type RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

/**
 * Supported HTTP methods for API requests
 */
type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Base interface for API responses
 */
interface ApiResponse {
  readonly success?: boolean;
  readonly timestamp?: string;
}

/**
 * Base interface for API error responses
 */
interface ApiErrorResponse extends ApiResponse {
  readonly statusCode: number;
  readonly timestamp: string;
  readonly path: string;
  readonly method: string;
  readonly message: string;
}

/**
 * Generic success response type
 */
interface ApiSuccessResponse<TData> extends ApiResponse {
  readonly data: TData;
}

/**
 * Query parameters type with strict string values
 */
type QueryParams = Readonly<Record<string, string>>;

/**
 * Custom headers type with strict string values
 */
type CustomHeaders = Readonly<Record<string, string>>;

/**
 * Configuration options for API requests
 */
interface RequestOptions<TRequestBody> {
  /** Query parameters to append to the URL */
  readonly params?: QueryParams;
  /** Request body data */
  readonly body?: TRequestBody;
  /** Custom headers to include in the request */
  readonly headers?: CustomHeaders;
  /** Request timeout in milliseconds */
  readonly timeout?: number;
}

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  public readonly name = "ApiError";

  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response: ApiErrorResponse,
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * API Client for making HTTP requests
 */
export class ApiClient {
  private static readonly baseUrl: string = getApiUrl();

  /**
   * Makes a GET request to the specified endpoint
   */
  static async get<TResponse>(
    endpoint: string,
    options?: Omit<RequestOptions<never>, "body">,
  ): Promise<ApiSuccessResponse<TResponse>> {
    return this.makeRequest<never, TResponse>("GET", endpoint, options);
  }

  /**
   * Makes a POST request to the specified endpoint
   */
  static async post<TRequest, TResponse>(
    endpoint: string,
    options?: RequestOptions<TRequest>,
  ): Promise<ApiSuccessResponse<TResponse>> {
    return this.makeRequest<TRequest, TResponse>("POST", endpoint, options);
  }

  /**
   * Makes a PUT request to the specified endpoint
   */
  static async put<TRequest, TResponse>(
    endpoint: string,
    options?: RequestOptions<TRequest>,
  ): Promise<ApiSuccessResponse<TResponse>> {
    return this.makeRequest<TRequest, TResponse>("PUT", endpoint, options);
  }

  /**
   * Makes a PATCH request to the specified endpoint
   */
  static async patch<TRequest, TResponse>(
    endpoint: string,
    options?: RequestOptions<TRequest>,
  ): Promise<ApiSuccessResponse<TResponse>> {
    return this.makeRequest<TRequest, TResponse>("PATCH", endpoint, options);
  }

  /**
   * Makes a DELETE request to the specified endpoint
   */
  static async delete<TResponse>(
    endpoint: string,
    options?: Omit<RequestOptions<never>, "body">,
  ): Promise<ApiSuccessResponse<TResponse>> {
    return this.makeRequest<never, TResponse>("DELETE", endpoint, options);
  }

  private static async makeRequest<TRequest, TResponse>(
    method: RequestMethod,
    endpoint: string,
    options: RequestOptions<TRequest> = {},
  ): Promise<ApiSuccessResponse<TResponse>> {
    const { params, body, headers: customHeaders, timeout } = options;

    try {
      const controller = new AbortController();
      const timeoutId =
        timeout &&
        setTimeout(() => {
          controller.abort();
        }, timeout);

      const response = await fetch(
        this.buildUrl(endpoint, params),
        await this.createRequestOptions(
          method,
          body,
          customHeaders,
          controller,
        ),
      );

      if (timeoutId) clearTimeout(timeoutId);

      return await this.handleResponse<TResponse>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private static async createRequestOptions(
    method: RequestMethod,
    body?: unknown,
    customHeaders?: CustomHeaders,
    controller?: AbortController,
  ): Promise<RequestInit> {
    const headers = await this.mergeHeaders(customHeaders);

    const requestOptions: RequestInit = {
      method,
      headers,
      cache: "default" as const,
      signal: controller?.signal,
    };

    if (body !== undefined) {
      requestOptions.body = JSON.stringify(body);
    }

    return requestOptions;
  }

  private static async mergeHeaders(
    customHeaders?: CustomHeaders,
  ): Promise<Headers> {
    const defaultHeaders = await this.getDefaultHeaders();

    if (!customHeaders) {
      return defaultHeaders;
    }

    const mergedHeaders = new Headers(defaultHeaders);
    Object.entries(customHeaders).forEach(([key, value]) => {
      mergedHeaders.set(key, value);
    });

    return mergedHeaders;
  }

  private static async getDefaultHeaders(): Promise<Headers> {
    const cookieStore = await cookies();
    const cookieHeader = this.createCookieHeader(cookieStore.getAll());

    return new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookieHeader,
    });
  }

  private static createCookieHeader(cookiesValue: RequestCookie[]): string {
    return cookiesValue
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
  }

  private static buildUrl(endpoint: string, params?: QueryParams): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      this.appendSearchParams(url, params);
    }

    return url.toString();
  }

  private static appendSearchParams(url: URL, params: QueryParams): void {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  private static async handleResponse<T>(
    response: Response,
  ): Promise<ApiSuccessResponse<T>> {
    if (!response.ok) {
      const errorData = (await response.json()) as ApiErrorResponse;

      throw new ApiError(errorData.message, response.status, errorData);
    }

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      throw new ApiError("Invalid response type", response.status, {
        success: false,
        timestamp: new Date().toISOString(),
        statusCode: response.status,
        path: response.url,
        method: "GET",
        message: "Expected JSON response",
      } as ApiErrorResponse);
    }

    const apiResponse = (await response.json()) as ApiSuccessResponse<T>;

    return {
      success: apiResponse.success ?? true,
      timestamp: apiResponse.timestamp ?? new Date().toISOString(),
      data: apiResponse.data,
    };
  }

  private static handleError(error: unknown): never {
    console.debug("error", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Network error", 500, {
      success: false,
      timestamp: new Date().toISOString(),
      statusCode: 500,
      path: "",
      method: "",
      message: "Failed to complete the request",
    });
  }
}
