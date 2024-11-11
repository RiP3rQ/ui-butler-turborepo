import { users } from '../schema';

export type User = typeof users.$inferSelect;
