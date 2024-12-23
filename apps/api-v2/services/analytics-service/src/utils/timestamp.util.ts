import { Timestamp } from '@app/proto';

export function dateToTimestamp(date: string | number): Timestamp {
  const dateObj = new Date(date);
  return {
    $type: 'google.protobuf.Timestamp',
    seconds: Math.floor(dateObj.getTime() / 1000),
    nanos: (dateObj.getTime() % 1000) * 1000000,
  };
}
