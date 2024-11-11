import { users } from '../schema/schema';

export type User = typeof users.$inferSelect;
