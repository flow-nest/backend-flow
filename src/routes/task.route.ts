import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
// Import your authentication middleware if needed
// import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Get all tasks with optional filtering
router.get('/', taskController.getAllTasks);

// Get a single task by ID
router.get('/:id', taskController.getTaskById);

// Create a new task
router.post('/', taskController.createTask);

// Update an existing task
router.put('/:id', taskController.updateTask);

// Delete a task
router.delete('/:id', taskController.deleteTask);

// Complete a task
router.patch('/:id/complete', taskController.completeTask);

// Get tasks assigned to a specific robot
router.get('/robot/:robotId', taskController.getTasksByRobot);

// Get tasks for a specific package
router.get('/package/:packageId', taskController.getTasksByPackage);

export default router;