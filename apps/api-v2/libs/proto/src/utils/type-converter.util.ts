export class TypeConverter {
  static toProtoMessage<T extends object>(dto: T): any {
    return this.transformObject(dto);
  }

  static fromProtoMessage<T>(protoMessage: any): T {
    return this.transformObject(protoMessage) as T;
  }

  private static transformObject(obj: any): any {
    if (!obj || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformObject(item));
    }

    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        transformed[key] = this.transformValue(value);
      }
    }

    return transformed;
  }

  private static transformValue(value: any): any {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === "object") {
      return this.transformObject(value);
    }
    return value;
  }
}
