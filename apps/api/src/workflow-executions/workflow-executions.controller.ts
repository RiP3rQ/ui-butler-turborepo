import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { CreateWorkflowExecutionDto } from './dto/create-workflow-execution.dto';
import { UpdateWorkflowExecutionDto } from './dto/update-workflow-execution.dto';

@Controller('executions-executions')
export class WorkflowExecutionsController {
  constructor(
    private readonly workflowExecutionsService: WorkflowExecutionsService,
  ) {}

  @Post()
  create(@Body() createWorkflowExecutionDto: CreateWorkflowExecutionDto) {
    return this.workflowExecutionsService.create(createWorkflowExecutionDto);
  }

  @Get()
  findAll() {
    return this.workflowExecutionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowExecutionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkflowExecutionDto: UpdateWorkflowExecutionDto,
  ) {
    return this.workflowExecutionsService.update(
      +id,
      updateWorkflowExecutionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowExecutionsService.remove(+id);
  }
}
