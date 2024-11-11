import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkflowExecutionDto } from './create-workflow-execution.dto';

export class UpdateWorkflowExecutionDto extends PartialType(CreateWorkflowExecutionDto) {}
