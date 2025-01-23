import { CurrentUser, JwtAuthGuard } from '@app/common';
import { ProjectsProto } from '@microservices/proto';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';

const CACHE_TTL_5_MINUTES = 300000;
const CACHE_KEY_PROJECTS = 'user-projects';
const CACHE_KEY_PROJECT_DETAILS = 'project-details';

/**
 * Controller handling project-related operations through gRPC communication
 * with the projects microservice.
 * @class ProjectsController
 */
@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController implements OnModuleInit {
  private projectsService: ProjectsProto.ProjectsServiceClient;

  constructor(
    @Inject('PROJECTS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  public onModuleInit(): void {
    this.projectsService =
      this.client.getService<ProjectsProto.ProjectsServiceClient>(
        'ProjectsService',
      );
  }

  /**
   * Retrieves all projects for the authenticated user
   * @param {ProjectsProto.User} user - The authenticated user
   * @returns {Promise<ProjectsProto.Project[]>} List of user's projects
   * @throws {NotFoundException} When user is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Get all user projects' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: JSON.stringify(ProjectsProto.Project),
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey(CACHE_KEY_PROJECTS)
  @CacheTTL(CACHE_TTL_5_MINUTES)
  @Get()
  public async getProjectsByUserId(
    @CurrentUser() user: ProjectsProto.User,
  ): Promise<ProjectsProto.Project[]> {
    if (!user?.id) {
      throw new NotFoundException('Unauthorized: User not found');
    }

    try {
      const request: ProjectsProto.GetProjectsRequest = {
        $type: 'api.projects.GetProjectsRequest',
        user: {
          $type: 'api.projects.User',
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };

      const response = await this.grpcClient.call(
        this.projectsService.getProjectsByUserId(request),
        'Projects.getProjectsByUserId',
      );

      return response.projects;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Retrieves detailed information for a specific project
   * @param {ProjectsProto.User} user - The authenticated user
   * @param {number} projectId - Project identifier
   * @returns {Promise<ProjectsProto.ProjectDetails>} Detailed project information
   * @throws {NotFoundException} When user or project is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Get project details' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project details retrieved successfully',
    type: JSON.stringify(ProjectsProto.ProjectDetails),
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey(CACHE_KEY_PROJECT_DETAILS)
  @CacheTTL(CACHE_TTL_5_MINUTES)
  @Get(':projectId')
  public async getProjectDetails(
    @CurrentUser() user: ProjectsProto.User,
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ProjectsProto.ProjectDetails> {
    if (!user?.id) {
      throw new NotFoundException('Unauthorized: User not found');
    }

    try {
      const request: ProjectsProto.GetProjectDetailsRequest = {
        $type: 'api.projects.GetProjectDetailsRequest',
        user: {
          $type: 'api.projects.User',
          id: user.id,
          email: user.email,
          username: user.username,
        },
        projectId,
      };

      return await this.grpcClient.call(
        this.projectsService.getProjectDetails(request),
        'Projects.getProjectDetails',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Creates a new project for the user
   * @param {ProjectsProto.User} user - The authenticated user
   * @param {ProjectsProto.CreateProjectDto} createProjectDto - Project creation data
   * @returns {Promise<ProjectsProto.Project>} The created project
   * @throws {NotFoundException} When user is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Create new project' })
  @ApiBody({ type: JSON.stringify(ProjectsProto.CreateProjectDto) })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: JSON.stringify(ProjectsProto.Project),
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 requests per minute
  @Post()
  public async createProject(
    @CurrentUser() user: ProjectsProto.User,
    @Body() createProjectDto: ProjectsProto.CreateProjectDto,
  ): Promise<ProjectsProto.Project> {
    if (!user?.id) {
      throw new NotFoundException('Unauthorized: User not found');
    }

    try {
      const request: ProjectsProto.CreateProjectRequest = {
        $type: 'api.projects.CreateProjectRequest',
        user: {
          $type: 'api.projects.User',
          id: user.id,
          email: user.email,
          username: user.username,
        },
        project: {
          ...createProjectDto,
        },
      };

      return await this.grpcClient.call(
        this.projectsService.createProject(request),
        'Projects.createProject',
      );
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
