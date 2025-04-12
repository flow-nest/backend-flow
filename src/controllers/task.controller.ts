import { Request, Response } from 'express';
import { taskService } from '../services/taskService';

export const taskController = {
    /**
     * Get all tasks with optional filtering
     */
    getAllTasks: async (req: any, res: any) => {
        try {
            const { status, robotId, packageId } = req.query;

            const filters: any = {};
            if (status) filters.status = status as string;
            if (robotId) filters.robotId = robotId as string;
            if (packageId) filters.packageId = packageId as string;

            const tasks = await taskService.getAllTasks(filters);
            return res.status(200).json(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return res.status(500).json({ message: 'Error fetching tasks', error });
        }
    },

    /**
     * Get a single task by ID
     */
    getTaskById: async (req: any, res: any) => {
        try {
            const { id } = req.params;
            const task = await taskService.getTaskById(id);

            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }

            return res.status(200).json(task);
        } catch (error) {
            console.error('Error fetching task:', error);
            return res.status(500).json({ message: 'Error fetching task', error });
        }
    },

    /**
     * Create a new task
     */
    createTask: async (req: any, res: any) => {
        try {
            const {
                packageId, packageData,
                robotId, robotData,
                status, completedAt
            } = req.body;

            // Validate that we have either packageId or packageData
            if (!packageId && !packageData) {
                return res.status(400).json({
                    message: 'Either packageId or packageData must be provided'
                });
            }

            // Validate that we have either robotId or robotData
            if (!robotId && !robotData) {
                return res.status(400).json({
                    message: 'Either robotId or robotData must be provided'
                });
            }

            // Validate status
            if (!status) {
                return res.status(400).json({
                    message: 'Status is required'
                });
            }

            // If packageData is provided, validate required fields
            if (packageData && (!packageData.qrCode || !packageData.size ||
                !packageData.weight || !packageData.location || !packageData.status)) {
                return res.status(400).json({
                    message: 'Package data is incomplete. Required fields: qrCode, size, weight, location, status'
                });
            }

            // If robotData is provided, validate required fields
            if (robotData && (!robotData.name || !robotData.status ||
                robotData.battery === undefined || !robotData.location || !robotData.lastMaintained)) {
                return res.status(400).json({
                    message: 'Robot data is incomplete. Required fields: name, status, battery, location, lastMaintained'
                });
            }

            const task = await taskService.createTask({
                packageId,
                packageData,
                robotId,
                robotData,
                status,
                completedAt: completedAt ? new Date(completedAt) : undefined
            });

            return res.status(201).json(task);
        } catch (error:any) {
            console.error('Error creating task:', error);

            if (error.message && error.message.includes('not found')) {
                return res.status(404).json({ message: error.message });
            }

            return res.status(500).json({
                message: 'Error creating task',
                error: error.message || error
            });
        }
    },
    /**
     * Update an existing task
     */
    updateTask: async (req: any, res: any) => {
        try {
            const { id } = req.params;
            const { packageId, robotId, status, completedAt } = req.body;

            // Check if task exists
            const existingTask = await taskService.getTaskById(id);
            if (!existingTask) {
                return res.status(404).json({ message: 'Task not found' });
            }

            const task = await taskService.updateTask(id, {
                packageId,
                robotId,
                status,
                completedAt: completedAt ? new Date(completedAt) : undefined
            });

            return res.status(200).json(task);
        } catch (error) {
            console.error('Error updating task:', error);
            return res.status(500).json({ message: 'Error updating task', error });
        }
    },

    /**
     * Delete a task
     */
    deleteTask: async (req: any, res: any) => {
        try {
            const { id } = req.params;

            // Check if task exists
            const existingTask = await taskService.getTaskById(id);
            if (!existingTask) {
                return res.status(404).json({ message: 'Task not found' });
            }

            await taskService.deleteTask(id);

            return res.status(204).send();
        } catch (error) {
            console.error('Error deleting task:', error);
            return res.status(500).json({ message: 'Error deleting task', error });
        }
    },

    /**
     * Complete a task
     */
    completeTask: async (req: any, res: any) => {
        try {
            const { id } = req.params;

            // Check if task exists
            const existingTask = await taskService.getTaskById(id);
            if (!existingTask) {
                return res.status(404).json({ message: 'Task not found' });
            }

            if (existingTask.status === 'COMPLETED') {
                return res.status(400).json({ message: 'Task is already completed' });
            }

            const task = await taskService.completeTask(id);

            return res.status(200).json(task);
        } catch (error) {
            console.error('Error completing task:', error);
            return res.status(500).json({ message: 'Error completing task', error });
        }
    },

    /**
     * Get tasks assigned to a specific robot
     */
    getTasksByRobot: async (req: any, res: any) => {
        try {
            const { robotId } = req.params;
            const tasks = await taskService.getTasksByRobot(robotId);

            return res.status(200).json(tasks);
        } catch (error) {
            console.error('Error fetching robot tasks:', error);
            return res.status(500).json({ message: 'Error fetching robot tasks', error });
        }
    },

    /**
     * Get tasks for a specific package
     */
    getTasksByPackage: async (req: any, res: any) => {
        try {
            const { packageId } = req.params;
            const tasks = await taskService.getTasksByPackage(packageId);

            return res.status(200).json(tasks);
        } catch (error) {
            console.error('Error fetching package tasks:', error);
            return res.status(500).json({ message: 'Error fetching package tasks', error });
        }
    }
};