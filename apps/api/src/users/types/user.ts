import { users } from '../../database/schemas/users';

export type User = typeof users.$inferSelect;
