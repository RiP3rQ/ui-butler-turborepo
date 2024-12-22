import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@app/common';
import { AnalyticsController } from '../analytics.controller';
import { AnalyticsService } from '../analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: jest.Mocked<AnalyticsService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'Test User',
    password: 'password',
    refreshToken: 'refresh_token',
  };

  beforeEach(async () => {
    const mockAnalyticsService = {
      getPeriods: jest.fn(),
      getStatCardsValues: jest.fn(),
      getWorkflowExecutionStats: jest.fn(),
      getUsedCreditsInPeriod: jest.fn(),
      getDashboardStatCardsValues: jest.fn(),
      getFavoritedTableContent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPeriods', () => {
    const mockPeriods = [
      { year: 2023, month: 12 },
      { year: 2024, month: 1 },
    ];

    it('should call service.getPeriods with correct user and return periods', async () => {
      service.getPeriods.mockResolvedValue(mockPeriods);

      const result = await controller.getPeriods({ user: mockUser });

      expect(result).toEqual(mockPeriods);
      expect(service.getPeriods).toHaveBeenCalledTimes(1);
      expect(service.getPeriods).toHaveBeenCalledWith(mockUser);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      service.getPeriods.mockRejectedValue(error);

      await expect(controller.getPeriods({ user: mockUser })).rejects.toThrow(
        error,
      );
    });
  });

  describe('getStatCardsValues', () => {
    const mockStatCards = {
      workflowExecutions: 10,
      creditsConsumed: 100,
      phasesExecuted: 20,
    };

    const payload = {
      user: mockUser,
      month: 1,
      year: 2024,
    };

    it('should call service.getStatCardsValues with correct parameters and return stats', async () => {
      service.getStatCardsValues.mockResolvedValue(mockStatCards);

      const result = await controller.getStatCardsValues(payload);

      expect(result).toEqual(mockStatCards);
      expect(service.getStatCardsValues).toHaveBeenCalledTimes(1);
      expect(service.getStatCardsValues).toHaveBeenCalledWith(
        mockUser,
        payload.month,
        payload.year,
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      service.getStatCardsValues.mockRejectedValue(error);

      await expect(controller.getStatCardsValues(payload)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getWorkflowExecutionStats', () => {
    const mockStats = [
      { date: '2024-01-01', successful: 5, failed: 2 },
      { date: '2024-01-02', successful: 3, failed: 1 },
    ];

    const payload = {
      user: mockUser,
      month: 1,
      year: 2024,
    };

    it('should call service.getWorkflowExecutionStats with correct parameters and return stats', async () => {
      service.getWorkflowExecutionStats.mockResolvedValue(mockStats);

      const result = await controller.getWorkflowExecutionStats(payload);

      expect(result).toEqual(mockStats);
      expect(service.getWorkflowExecutionStats).toHaveBeenCalledTimes(1);
      expect(service.getWorkflowExecutionStats).toHaveBeenCalledWith(
        mockUser,
        payload.month,
        payload.year,
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      service.getWorkflowExecutionStats.mockRejectedValue(error);

      await expect(
        controller.getWorkflowExecutionStats(payload),
      ).rejects.toThrow(error);
    });
  });

  describe('getUsedCreditsInPeriod', () => {
    const mockCreditsStats = [
      { date: '2024-01-01', successful: 50, failed: 20 },
      { date: '2024-01-02', successful: 30, failed: 10 },
    ];

    const payload = {
      user: mockUser,
      month: 1,
      year: 2024,
    };

    it('should call service.getUsedCreditsInPeriod with correct parameters and return stats', async () => {
      service.getUsedCreditsInPeriod.mockResolvedValue(mockCreditsStats);

      const result = await controller.getUsedCreditsInPeriod(payload);

      expect(result).toEqual(mockCreditsStats);
      expect(service.getUsedCreditsInPeriod).toHaveBeenCalledTimes(1);
      expect(service.getUsedCreditsInPeriod).toHaveBeenCalledWith(
        mockUser,
        payload.month,
        payload.year,
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      service.getUsedCreditsInPeriod.mockRejectedValue(error);

      await expect(controller.getUsedCreditsInPeriod(payload)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getDashboardStatCardsValues', () => {
    const mockDashboardStats = {
      currentActiveProjects: 5,
      numberOfCreatedComponents: 15,
      favoritesComponents: 3,
    };

    it('should call service.getDashboardStatCardsValues with correct user and return stats', async () => {
      service.getDashboardStatCardsValues.mockResolvedValue(mockDashboardStats);

      const result = await controller.getDashboardStatCardsValues({
        user: mockUser,
      });

      expect(result).toEqual(mockDashboardStats);
      expect(service.getDashboardStatCardsValues).toHaveBeenCalledTimes(1);
      expect(service.getDashboardStatCardsValues).toHaveBeenCalledWith(
        mockUser,
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      service.getDashboardStatCardsValues.mockRejectedValue(error);

      await expect(
        controller.getDashboardStatCardsValues({ user: mockUser }),
      ).rejects.toThrow(error);
    });
  });

  describe('getFavoritedTableContent', () => {
    const mockFavorites = [
      {
        id: 1,
        name: 'Component 1',
        projectName: 'Project 1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        name: 'Component 2',
        projectName: 'Project 2',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      },
    ];

    it('should call service.getFavoritedTableContent with correct user and return favorites', async () => {
      service.getFavoritedTableContent.mockResolvedValue(mockFavorites);

      const result = await controller.getFavoritedTableContent({
        user: mockUser,
      });

      expect(result).toEqual(mockFavorites);
      expect(service.getFavoritedTableContent).toHaveBeenCalledTimes(1);
      expect(service.getFavoritedTableContent).toHaveBeenCalledWith(mockUser);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      service.getFavoritedTableContent.mockRejectedValue(error);

      await expect(
        controller.getFavoritedTableContent({ user: mockUser }),
      ).rejects.toThrow(error);
    });
  });
});
