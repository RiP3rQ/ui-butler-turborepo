import { IsString } from "class-validator";

export class DatabaseConfig {
  @IsString()
  readonly DATABASE_URL: string;
}
