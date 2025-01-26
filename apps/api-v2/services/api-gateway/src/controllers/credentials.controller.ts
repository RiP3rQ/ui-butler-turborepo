import {
  CreateCredentialDto,
  CurrentUser,
  JwtAuthGuard,
  type User,
} from '@microservices/common';
import { UsersProto } from '@microservices/proto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RateLimit } from '../throttling/rate-limit.decorator';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';

/**
/**
 * Controller handling user credentials operations through gRPC communication
 * with the users microservice.
 * @class CredentialsController
 */
@ApiTags('Credentials')
@ApiBearerAuth()
@Controller('credentials')
@UseGuards(JwtAuthGuard)
export class CredentialsController implements OnModuleInit {
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
   * Retrieves all credentials for the authenticated user
   * @param {User} user - The authenticated user
   * @returns {Promise<UsersProto.Credential[]>} List of user credentials
   * @throws {NotFoundException} When user is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Get all user credentials' })
  @ApiResponse({
    status: 200,
    description: 'Credentials retrieved successfully',
    type: JSON.stringify(UsersProto.Credential),
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  // @UseInterceptors(CacheInterceptor) TODO: FIX THIS CACHING
  @Get()
  public async getUserCredentials(
    @CurrentUser() user: User,
  ): Promise<UsersProto.Credential[]> {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
    }

    try {
      const request: UsersProto.GetCredentialsRequest = {
        $type: 'api.users.GetCredentialsRequest',
        user: {
          $type: 'api.users.User',
          id: user.id,
          email: user.email,
          username: user.username ?? '',
        },
      };

      const response = await this.grpcClient.call(
        this.usersService.getUserCredentials(request),
        'Credentials.getUserCredentials',
      );

      return response.credentials;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Creates a new credential for the user
   * @param {User} user - The authenticated user
   * @param {CreateCredentialDto} createCredentialDto - Credential creation data
   * @returns {Promise<UsersProto.Credential>} The created credential
   * @throws {NotFoundException} When user is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Create new credential' })
  @ApiBody({ type: CreateCredentialDto })
  @ApiResponse({
    status: 201,
    description: 'Credential created successfully',
    type: JSON.stringify(UsersProto.Credential),
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @Post()
  public async createCredential(
    @CurrentUser() user: User,
    @Body() createCredentialDto: CreateCredentialDto,
  ): Promise<UsersProto.Credential> {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
    }

    try {
      const request: UsersProto.CreateCredentialRequest = {
        $type: 'api.users.CreateCredentialRequest',
        user: {
          $type: 'api.users.User',
          id: user.id,
          email: user.email,
          username: user.username ?? '',
        },
        credential: {
          $type: 'api.users.CreateCredentialDto',
          ...createCredentialDto,
        },
      };

      return await this.grpcClient.call(
        this.usersService.createCredential(request),
        'Credentials.createCredential',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Deletes a user credential by ID
   * @param {User} user - The authenticated user
   * @param {string} id - Credential identifier
   * @returns {Promise<UsersProto.Credential>} The deleted credential
   * @throws {NotFoundException} When user or credential is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Delete credential' })
  @ApiQuery({ name: 'id', type: String, description: 'Credential ID' })
  @ApiResponse({
    status: 200,
    description: 'Credential deleted successfully',
    type: JSON.stringify(UsersProto.Credential),
  })
  @ApiResponse({ status: 404, description: 'User or credential not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @Delete()
  public async deleteCredential(
    @CurrentUser() user: User,
    @Query('id', ParseIntPipe) id: number,
  ): Promise<UsersProto.Credential> {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
    }

    try {
      const request: UsersProto.DeleteCredentialRequest = {
        $type: 'api.users.DeleteCredentialRequest',
        user: {
          $type: 'api.users.User',
          id: user.id,
          email: user.email,
          username: user.username ?? '',
        },
        id,
      };

      return await this.grpcClient.call(
        this.usersService.deleteCredential(request),
        'Credentials.deleteCredential',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Reveals the value of a credential
   * @param {User} user - The authenticated user
   * @param {string} id - Credential identifier
   * @returns {Promise<UsersProto.RevealedCredential>} The revealed credential
   * @throws {NotFoundException} When user or credential is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Reveal credential value' })
  @ApiParam({ name: 'id', type: String, description: 'Credential ID' })
  @ApiResponse({
    status: 200,
    description: 'Credential value revealed successfully',
    type: JSON.stringify(UsersProto.RevealedCredential),
  })
  @ApiResponse({ status: 404, description: 'User or credential not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @RateLimit({
    ttl: 60,
    limit: 5,
    errorMessage: 'Too many reveal credential requests. Try again in 1 minute.',
  })
  @Get(':id/reveal')
  public async getRevealedCredentialValue(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UsersProto.RevealedCredential> {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
    }

    try {
      const request: UsersProto.RevealCredentialRequest = {
        $type: 'api.users.RevealCredentialRequest',
        user: {
          $type: 'api.users.User',
          id: user.id,
          email: user.email,
          username: user.username ?? '',
        },
        id,
      };

      return await this.grpcClient.call(
        this.usersService.revealCredential(request),
        'Credentials.RevealCredential',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
