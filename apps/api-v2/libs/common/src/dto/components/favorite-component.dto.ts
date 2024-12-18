import { IsBoolean, IsInt, IsNotEmpty, Min } from "class-validator";
import { Transform } from "class-transformer";

export class FavoriteComponentDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  projectId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  componentId: number;

  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  favoriteValue: boolean;
}
