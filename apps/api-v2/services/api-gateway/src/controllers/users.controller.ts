import { CurrentUser, JwtAuthGuard } from '@microservices/common';
import { UsersProto } from '@microservices/proto';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  OnModuleInit,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SkipRateLimit } from 'src/decorators/rate-limit.decorator';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';

const CACHE_TTL_30_SECONDS = 30000;
const CACHE_TTL_1_MINUTE = 60000;
const CACHE_KEY_ALL_USERS = 'users:all';
const CACHE_KEY_USER_DETAIL = 'users:detail';

/**
 * Controller handling user-related operations through gRPC communication
 * with the users microservice.
 * @class UsersController
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController implements OnModuleInit {
  private usersService: UsersProto.UsersServiceClient;

  constructor(
    @Inject('USERS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  public onModuleInit(): void {
    this.usersService =
      this.client.getService<UsersProto.UsersServiceClient>('UsersService');
  }

  /**
   * Retrieves all users in the system
   * @returns {Promise<UsersProto.GetUsersResponse>} List of all users
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: JSON.stringify(UsersProto.GetUsersResponse),
  })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor)
  @CacheKey(CACHE_KEY_ALL_USERS)
  @CacheTTL(CACHE_TTL_30_SECONDS)
  @Get()
  public async getUsers(): Promise<UsersProto.GetUsersResponse> {
    try {
      const request: UsersProto.Empty = { $type: 'api.users.Empty' };

      return await this.grpcClient.call<UsersProto.GetUsersResponse>(
        this.usersService.getUsers(request),
        'Users.getUsers',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Retrieves basic information for the current user
   * @param {UsersProto.User} user - The authenticated user
   * @returns {Promise<UsersProto.GetCurrentUserResponse>} Current user's basic information
   * @throws {NotFoundException} When user is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Get current user basic information' })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: JSON.stringify(UsersProto.GetCurrentUserResponse),
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor)
  @CacheKey(CACHE_KEY_USER_DETAIL)
  @CacheTTL(CACHE_TTL_1_MINUTE)
  @SkipRateLimit()
  @Get('current-basic')
  public async getCurrentUser(
    @CurrentUser() user: UsersProto.User,
  ): Promise<UsersProto.GetCurrentUserResponse> {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
    }

    try {
      const request: UsersProto.GetCurrentUserRequest = {
        $type: 'api.users.GetCurrentUserRequest',
        user: {
          ...user,
          $type: 'api.users.User',
        },
      };

      return await this.grpcClient.call<UsersProto.GetCurrentUserResponse>(
        this.usersService.getCurrentUser(request),
        'Users.getCurrentUser',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Creates a new user profile
   * @param {UsersProto.CreateProfileDto} createProfileDto - Profile creation data
   * @returns {Promise<UsersProto.Profile>} The created profile
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Create user profile' })
  @ApiBody({ type: JSON.stringify(UsersProto.CreateProfileDto) })
  @ApiResponse({
    status: 201,
    description: 'Profile created successfully',
    type: JSON.stringify(UsersProto.Profile),
  })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @Post('profile')
  public async createProfile(
    @Body() createProfileDto: UsersProto.CreateProfileDto,
  ): Promise<UsersProto.Profile> {
    try {
      const request: UsersProto.CreateProfileDto = {
        ...createProfileDto,
      };

      return await this.grpcClient.call<UsersProto.Profile>(
        this.usersService.createProfile(request),
        'Users.createProfile',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Creates a new user
   * @param {UsersProto.CreateUserDto} createUserDto - User creation data
   * @returns {Promise<UsersProto.User>} The created user
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({ type: JSON.stringify(UsersProto.CreateUserDto) })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: JSON.stringify(UsersProto.User),
  })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @Post()
  public async createUser(
    @Body() createUserDto: UsersProto.CreateUserDto,
  ): Promise<UsersProto.User> {
    try {
      const request: UsersProto.CreateUserDto = {
        ...createUserDto,
        $type: 'api.users.CreateUserDto',
      };

      return await this.grpcClient.call<UsersProto.User>(
        this.usersService.createUser(request),
        'Users.createUser',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
