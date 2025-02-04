import { CurrentUser, JwtAuthGuard } from '@microservices/common';
import { ProjectsProto } from '@microservices/proto';
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
  Put,
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
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';
import { CACHE_TTL, CacheGroup, CacheTTL } from 'src/caching/cache.decorator';
import { CustomCacheInterceptor } from 'src/caching/custom-cache.interceptor';
import { CacheService } from 'src/caching/cache.service';

/**
 * Controller handling project-related operations through gRPC communication
 * with the projects microservice.
 * @class ProjectsController
 */
@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CustomCacheInterceptor)
@CacheGroup('projects')
export class ProjectsController implements OnModuleInit {
  private projectsService: ProjectsProto.ProjectsServiceClient;

  constructor(
    @Inject('PROJECTS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
    @Inject(CacheService)
    private readonly cacheService: CacheService,
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
  @CacheTTL(CACHE_TTL.FIVE_MINUTES)
  @Get()
  public async getProjectsByUserId(
    @CurrentUser() user: ProjectsProto.User,
  ): Promise<ProjectsProto.Project[]> {
    if (!user.id) {
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
  @CacheTTL(CACHE_TTL.FIVE_MINUTES)
  @Get(':projectId')
  public async getProjectDetails(
    @CurrentUser() user: ProjectsProto.User,
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ProjectsProto.ProjectDetails> {
    if (!user.id) {
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
  @Post()
  public async createProject(
    @CurrentUser() user: ProjectsProto.User,
    @Body() createProjectDto: ProjectsProto.CreateProjectDto,
  ): Promise<ProjectsProto.Project> {
    if (!user.id) {
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

      const response = await this.grpcClient.call(
        this.projectsService.createProject(request),
        'Projects.createProject',
      );

      await this.cacheService.invalidateGroup('projects');

      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Updates an existing project for the user
   * @param {ProjectsProto.User} user - The authenticated user
   * @param {number} projectId - Project identifier
   * @param {ProjectsProto.CreateProjectDto} updateProjectDto - Project update data
   * @returns {Promise<ProjectsProto.Project>} The updated project
   * @throws {NotFoundException} When user or project is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Update project' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project ID' })
  @ApiBody({ type: JSON.stringify(ProjectsProto.CreateProjectDto) })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: JSON.stringify(ProjectsProto.Project),
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @Put(':projectId')
  public async updateProject(
    @CurrentUser() user: ProjectsProto.User,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() updateProjectDto: ProjectsProto.CreateProjectDto,
  ): Promise<ProjectsProto.Project> {
    if (!user.id) {
      throw new NotFoundException('Unauthorized: User not found');
    }

    try {
      const request: ProjectsProto.UpdateProjectRequest = {
        $type: 'api.projects.UpdateProjectRequest',
        user: {
          $type: 'api.projects.User',
          id: user.id,
          email: user.email,
          username: user.username,
        },
        projectId,
        project: {
          ...updateProjectDto,
        },
      };

      const response = await this.grpcClient.call(
        this.projectsService.updateProject(request),
        'Projects.updateProject',
      );

      await this.cacheService.invalidateGroup('projects');

      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }

  /**
   * Deletes an existing project for the user
   * @param {ProjectsProto.User} user - The authenticated user
   * @param {number} projectId - Project identifier
   * @returns {Promise<ProjectsProto.Project>} The deleted project
   * @throws {NotFoundException} When user or project is not found
   * @throws {GrpcException} When gRPC service fails
   */
  @ApiOperation({ summary: 'Delete project' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
    type: JSON.stringify(ProjectsProto.Project),
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 500, description: 'gRPC service error' })
  @Delete(':projectId')
  public async deleteProject(
    @CurrentUser() user: ProjectsProto.User,
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ProjectsProto.Project> {
    if (!user.id) {
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

      const response = await this.grpcClient.call(
        this.projectsService.deleteProject(request),
        'Projects.deleteProject',
      );

      await this.cacheService.invalidateGroup('projects');

      return response;
    } catch (error) {
      handleGrpcError(error);
    }
  }
}
