import { Injectable } from '@nestjs/common';
import { CreateWorkflowExecutionDto } from './dto/create-workflow-execution.dto';
import { UpdateWorkflowExecutionDto } from './dto/update-workflow-execution.dto';

@Injectable()
export class WorkflowExecutionsService {
  create(createWorkflowExecutionDto: CreateWorkflowExecutionDto) {
    return 'This action adds a new workflowExecution';
  }

  findAll() {
    return `This action returns all workflowExecutions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workflowExecution`;
  }

  update(id: number, updateWorkflowExecutionDto: UpdateWorkflowExecutionDto) {
    return `This action updates a #${id} workflowExecution`;
  }

  remove(id: number) {
    return `This action removes a #${id} workflowExecution`;
  }
}
