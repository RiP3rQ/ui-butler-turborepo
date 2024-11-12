import { Controller } from '@nestjs/common';
import { WorkflowExecutionsService } from './workflow-executions.service';

@Controller('executions-executions')
export class WorkflowExecutionsController {
  constructor(
    private readonly workflowExecutionsService: WorkflowExecutionsService,
  ) {}
}
