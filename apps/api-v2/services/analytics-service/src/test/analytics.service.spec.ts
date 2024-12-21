import { Test, TestingModule } from '@nestjs/testing';
import { DATABASE_CONNECTION } from '@app/database';
import { User } from '@app/common';
import { NotFoundException } from '@nestjs/common';
import { AnalyticsService } from '../analytics.service.ts';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockDatabase: jest.Mocked<any>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'Test User',
    password: 'password',
    refreshToken: 'refresh_token',
  };

  beforeEach(async () => {
    mockDatabase = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPeriods', () => {
    it('should return periods when data exists', async () => {
      const mockMinYear = new Date('2023-01-01');
      mockDatabase.where.mockResolvedValueOnce([{ minYear: mockMinYear }]);

      const result = await service.getPeriods(mockUser);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
      const currentYear = new Date().getFullYear();
      const expectedPeriodsCount = (currentYear - 2023 + 1) * 12;
      expect(result).toHaveLength(expectedPeriodsCount);
      expect(result[0]).toEqual({ year: 2023, month: 1 });
    });

    it('should return current year periods when no data exists', async () => {
      mockDatabase.where.mockResolvedValueOnce([]);

      const result = await service.getPeriods(mockUser);

      const currentYear = new Date().getFullYear();
      expect(result).toHaveLength(12);
      expect(result[0]).toEqual({ year: currentYear, month: 1 });
    });

    it('should return current year periods when minYear is null', async () => {
      mockDatabase.where.mockResolvedValueOnce([{ minYear: null }]);

      const result = await service.getPeriods(mockUser);

      const currentYear = new Date().getFullYear();
      expect(result).toHaveLength(12);
      expect(result[0]).toEqual({ year: currentYear, month: 1 });
    });

    it('should throw NotFoundException when no data is returned', async () => {
      // This specifically test the case where yearsData is undefined/null
      mockDatabase.where.mockResolvedValueOnce(undefined);

      await expect(service.getPeriods(mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatCardsValues', () => {
    const mockPeriod = { month: 1, year: 2024 };

    it('should calculate stat cards values correctly', async () => {
      const mockExecutions = [
        { creditsConsumed: 10 },
        { creditsConsumed: 20 },
        { creditsConsumed: null },
      ];
      const mockPhases = [{ creditsCost: 5 }, { creditsCost: 15 }];

      mockDatabase.where
        .mockResolvedValueOnce(mockExecutions)
        .mockResolvedValueOnce(mockPhases);

      const result = await service.getStatCardsValues(
        mockUser,
        mockPeriod.month,
        mockPeriod.year,
      );

      expect(result).toEqual({
        workflowExecutions: 3,
        creditsConsumed: 30,
        phasesExecuted: 2,
      });
    });

    it('should handle empty results', async () => {
      mockDatabase.where.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await service.getStatCardsValues(
        mockUser,
        mockPeriod.month,
        mockPeriod.year,
      );

      expect(result).toEqual({
        workflowExecutions: 0,
        creditsConsumed: 0,
        phasesExecuted: 0,
      });
    });
  });

  describe('getWorkflowExecutionStats', () => {
    const mockPeriod = { month: 1, year: 2024 };

    it('should calculate workflow execution stats correctly', async () => {
      const mockExecutions = [
        { status: 'COMPLETED', startedAt: new Date('2024-01-01') },
        { status: 'FAILED', startedAt: new Date('2024-01-01') },
        { status: 'COMPLETED', startedAt: new Date('2024-01-02') },
        { status: 'RUNNING', startedAt: new Date('2024-01-02') },
        { status: 'COMPLETED', startedAt: null },
      ];

      mockDatabase.where.mockResolvedValueOnce(mockExecutions);

      const result = await service.getWorkflowExecutionStats(
        mockUser,
        mockPeriod.month,
        mockPeriod.year,
      );

      expect(Array.isArray(result)).toBeTruthy();
      expect(result.find((r) => r.date === '2024-01-01')).toEqual({
        date: '2024-01-01',
        successful: 1,
        failed: 1,
      });
    });

    it('should handle empty results', async () => {
      mockDatabase.where.mockResolvedValueOnce([]);

      const result = await service.getWorkflowExecutionStats(
        mockUser,
        mockPeriod.month,
        mockPeriod.year,
      );

      expect(Array.isArray(result)).toBeTruthy();
      expect(
        result.every((day) => day.successful === 0 && day.failed === 0),
      ).toBeTruthy();
    });
  });

  describe('getUsedCreditsInPeriod', () => {
    const mockPeriod = { month: 1, year: 2024 };

    it('should calculate used credits correctly with various phase statuses', async () => {
      const mockPhases = [
        // Test completed status with credits
        {
          status: 'COMPLETED',
          startedAt: new Date('2024-01-01'),
          creditsCost: 10,
        },
        // Test failed status with credits
        {
          status: 'FAILED',
          startedAt: new Date('2024-01-01'),
          creditsCost: 5,
        },
        // Test completed status with null credits
        {
          status: 'COMPLETED',
          startedAt: new Date('2024-01-02'),
          creditsCost: null,
        },
        // Test phase with no startedAt
        {
          status: 'COMPLETED',
          startedAt: null,
          creditsCost: 15,
        },
        // Test different status
        {
          status: 'RUNNING',
          startedAt: new Date('2024-01-02'),
          creditsCost: 20,
        },
        // Test phase with undefined creditsCost
        {
          status: 'COMPLETED',
          startedAt: new Date('2024-01-01'),
          creditsCost: undefined,
        },
      ];

      mockDatabase.where.mockResolvedValueOnce(mockPhases);

      const result = await service.getUsedCreditsInPeriod(
        mockUser,
        mockPeriod.month,
        mockPeriod.year,
      );

      // Convert result array to an object for easier testing
      const resultByDate = result.reduce((acc, item) => {
        acc[item.date] = item;
        return acc;
      }, {});

      // Test January 1st totals
      expect(resultByDate['2024-01-01']).toEqual({
        date: '2024-01-01',
        successful: 10, // 10 from first phase + 0 from undefined creditsCost
        failed: 5, // 5 from second phase
      });

      // Test January 2nd totals
      expect(resultByDate['2024-01-02']).toEqual({
        date: '2024-01-02',
        successful: 0, // 0 from null creditsCost
        failed: 0, // no failed phases on this date
      });

      // Verify all dates in the month are included
      expect(result.length).toBe(31); // January has 31 days
    });

    it('should handle empty phases array', async () => {
      mockDatabase.where.mockResolvedValueOnce([]);

      const result = await service.getUsedCreditsInPeriod(
        mockUser,
        mockPeriod.month,
        mockPeriod.year,
      );

      expect(result.length).toBe(31); // Should still return all days in January
      expect(
        result.every((day) => day.successful === 0 && day.failed === 0),
      ).toBe(true);
    });

    it('should handle invalid date formats', async () => {
      const mockPhases = [
        {
          status: 'COMPLETED',
          startedAt: 'invalid-date', // Invalid date
          creditsCost: 10,
        },
        {
          status: 'COMPLETED',
          startedAt: new Date('2024-01-01'), // Valid date
          creditsCost: 20,
        },
      ];

      mockDatabase.where.mockResolvedValueOnce(mockPhases);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.getUsedCreditsInPeriod(
        mockUser,
        mockPeriod.month,
        mockPeriod.year,
      );

      // Should not crash and should return all days
      expect(result.length).toBe(31);

      // Valid date should be processed
      const jan1Data = result.find((day) => day.date === '2024-01-01');
      expect(jan1Data).toEqual({
        date: '2024-01-01',
        successful: 20,
        failed: 0,
      });

      // Invalid date should be logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid date format:',
        'invalid-date',
      );

      consoleSpy.mockRestore();
    });

    it('should accumulate multiple phases on the same date', async () => {
      const mockPhases = [
        {
          status: 'COMPLETED',
          startedAt: new Date('2024-01-01'),
          creditsCost: 10,
        },
        {
          status: 'COMPLETED',
          startedAt: new Date('2024-01-01'),
          creditsCost: 15,
        },
        {
          status: 'FAILED',
          startedAt: new Date('2024-01-01'),
          creditsCost: 5,
        },
        {
          status: 'FAILED',
          startedAt: new Date('2024-01-01'),
          creditsCost: 8,
        },
      ];

      mockDatabase.where.mockResolvedValueOnce(mockPhases);

      const result = await service.getUsedCreditsInPeriod(
        mockUser,
        mockPeriod.month,
        mockPeriod.year,
      );

      const jan1Data = result.find((day) => day.date === '2024-01-01');
      expect(jan1Data).toEqual({
        date: '2024-01-01',
        successful: 25, // 10 + 15
        failed: 13, // 5 + 8
      });
    });

    it('should handle empty results', async () => {
      mockDatabase.where.mockResolvedValueOnce([]);

      const result = await service.getUsedCreditsInPeriod(
        mockUser,
        mockPeriod.month,
        mockPeriod.year,
      );

      expect(Array.isArray(result)).toBeTruthy();
      expect(
        result.every((day) => day.successful === 0 && day.failed === 0),
      ).toBeTruthy();
    });
  });

  describe('getDashboardStatCardsValues', () => {
    it('should return dashboard stats correctly', async () => {
      const mockStats = [
        {
          currentActiveProjects: 5,
          numberOfCreatedComponents: 10,
          favoritesComponents: 3,
        },
      ];

      mockDatabase.where.mockResolvedValueOnce(mockStats);

      const result = await service.getDashboardStatCardsValues(mockUser);

      expect(result).toEqual({
        currentActiveProjects: 5,
        numberOfCreatedComponents: 10,
        favoritesComponents: 3,
      });
    });

    it('should handle null values', async () => {
      mockDatabase.where.mockResolvedValueOnce([
        {
          currentActiveProjects: null,
          numberOfCreatedComponents: null,
          favoritesComponents: null,
        },
      ]);

      const result = await service.getDashboardStatCardsValues(mockUser);

      expect(result).toEqual({
        currentActiveProjects: 0,
        numberOfCreatedComponents: 0,
        favoritesComponents: 0,
      });
    });

    it('should handle empty results', async () => {
      mockDatabase.where.mockResolvedValueOnce([]);

      const result = await service.getDashboardStatCardsValues(mockUser);

      expect(result).toEqual({
        currentActiveProjects: 0,
        numberOfCreatedComponents: 0,
        favoritesComponents: 0,
      });
    });
  });

  describe('getFavoritedTableContent', () => {
    it('should return favorited components correctly', async () => {
      const mockComponents = [
        {
          id: 1,
          name: 'Component 1',
          projectName: 'Project 1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockDatabase.where.mockResolvedValueOnce(mockComponents);

      const result = await service.getFavoritedTableContent(mockUser);

      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0]).toEqual({
        id: 1,
        name: 'Component 1',
        projectName: 'Project 1',
        createdAt: mockComponents[0].createdAt.toISOString(),
        updatedAt: mockComponents[0].updatedAt.toISOString(),
      });
    });

    it('should handle empty results', async () => {
      mockDatabase.where.mockResolvedValueOnce([]);

      const result = await service.getFavoritedTableContent(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('private methods', () => {
    describe('periodToDateRange', () => {
      it('should convert period to date range correctly', () => {
        const period = { month: 1, year: 2024 };
        const result = (service as any).periodToDateRange(period);

        expect(result.startDate).toEqual(new Date(2024, 0, 1));
        expect(result.endDate).toEqual(new Date(2024, 1, 0));
      });
    });

    describe('initializeDateStats', () => {
      it('should initialize date stats correctly', () => {
        const startDate = new Date(2024, 0, 1);
        const endDate = new Date(2024, 0, 3);
        const dateFormat = 'yyyy-MM-dd';

        const result = (service as any).initializeDateStats(
          startDate,
          endDate,
          dateFormat,
        );

        expect(Object.keys(result)).toHaveLength(3);
        expect(result['2024-01-01']).toEqual({ successful: 0, failed: 0 });
        expect(result['2024-01-02']).toEqual({ successful: 0, failed: 0 });
        expect(result['2024-01-03']).toEqual({ successful: 0, failed: 0 });
      });
    });
  });
});
