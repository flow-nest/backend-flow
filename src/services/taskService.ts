import { PrismaClient, Task } from '@prisma/client';

const prisma = new PrismaClient();

export const taskService = {
  /**
   * Get all tasks with optional filtering
   */
  getAllTasks: async (filters?: {
    status?: string;
    robotId?: string;
    packageId?: string;
  }) => {
    return prisma.task.findMany({
      where: filters,
      include: {
        robot: true,
        package: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },
  
  /**
   * Get a single task by ID
   */
  getTaskById: async (id: string) => {
    return prisma.task.findUnique({
      where: { id },
      include: {
        robot: true,
        package: true
      }
    });
  },
  
  /**
   * Create a new task with robot and package
   * If robotId or packageId are provided but don't exist, they will be created
   */
  createTask: async (data: {
    packageId?: string;
    packageData?: {
      qrCode: string;
      size: number;
      weight: number;
      location: string;
      status: string;
      shelfId?: string;
    };
    robotId?: string;
    robotData?: {
      name: string;
      status: string;
      battery: number;
      location: string;
      lastMaintained: string;
    };
    status: string;
    completedAt?: Date;
  }) => {
    // Use a transaction to ensure all operations succeed or fail together
    return prisma.$transaction(async (tx) => {
      let packageId = data.packageId;
      let robotId = data.robotId;
      
      // Create package if packageId is not provided but packageData is
      if (!packageId && data.packageData) {
        const newPackage = await tx.package.create({
          data: data.packageData
        });
        packageId = newPackage.id;
      } 
      // Check if packageId exists
      else if (packageId) {
        const existingPackage = await tx.package.findUnique({
          where: { id: packageId }
        });
        
        if (!existingPackage && data.packageData) {
          // Create package with specified ID if it doesn't exist
          const newPackage = await tx.package.create({
            data: {
              id: packageId,
              ...data.packageData
            }
          });
        } else if (!existingPackage) {
          throw new Error(`Package with ID ${packageId} not found and no package data provided`);
        }
      } else {
        throw new Error('Either packageId or packageData must be provided');
      }
      
      // Create robot if robotId is not provided but robotData is
      if (!robotId && data.robotData) {
        const newRobot = await tx.robot.create({
          data: data.robotData
        });
        robotId = newRobot.id;
      } 
      // Check if robotId exists
      else if (robotId) {
        const existingRobot = await tx.robot.findUnique({
          where: { id: robotId }
        });
        
        if (!existingRobot && data.robotData) {
          // Create robot with specified ID if it doesn't exist
          const newRobot = await tx.robot.create({
            data: {
              id: robotId,
              ...data.robotData
            }
          });
        } else if (!existingRobot) {
          throw new Error(`Robot with ID ${robotId} not found and no robot data provided`);
        }
      } else {
        throw new Error('Either robotId or robotData must be provided');
      }
      
      // Create the task with the package and robot IDs
      return tx.task.create({
        data: {
          packageId: packageId!,
          robotId: robotId!,
          status: data.status,
          completedAt: data.completedAt
        },
        include: {
          robot: true,
          package: true
        }
      });
    });
  },
  
  /**
   * Update an existing task
   */
  updateTask: async (id: string, data: {
    packageId?: string;
    robotId?: string;
    status?: string;
    completedAt?: Date | null;
  }) => {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        robot: true,
        package: true
      }
    });
  },
  
  /**
   * Delete a task
   */
  deleteTask: async (id: string) => {
    return prisma.task.delete({
      where: { id }
    });
  },
  
  /**
   * Complete a task
   */
  completeTask: async (id: string) => {
    return prisma.task.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      },
      include: {
        robot: true,
        package: true
      }
    });
  },
  
  /**
   * Get tasks assigned to a specific robot
   */
  getTasksByRobot: async (robotId: string) => {
    return prisma.task.findMany({
      where: { robotId },
      include: {
        package: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },
  
  /**
   * Get tasks for a specific package
   */
  getTasksByPackage: async (packageId: string) => {
    return prisma.task.findMany({
      where: { packageId },
      include: {
        robot: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
};