import { type Timestamp } from "@microservices/proto";

export function dateToTimestamp(date: Date | string | number): Timestamp {
  const dateObj = new Date(date);
  return {
    $type: "google.protobuf.Timestamp",
    seconds: Math.floor(dateObj.getTime() / 1000),
    nanos: (dateObj.getTime() % 1000) * 1000000,
  };
}

export function timestampToDate(timestamp: Timestamp): Date {
  return new Date(timestamp.seconds * 1000 + timestamp.nanos / 1000000);
}
