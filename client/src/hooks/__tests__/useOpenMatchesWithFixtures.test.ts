import { renderHook } from '@testing-library/react';
import { useOpenMatchesWithFixtures } from '../useOpenMatchesWithFixtures';

// Mock the dependencies
jest.mock('wagmi', () => ({
  useContractRead: jest.fn(),
}));

jest.mock('../useFixtures', () => ({
  useUpcomingFixturesQuery: jest.fn(),
}));

jest.mock('../useTeamLogos', () => ({
  useTeamLogos: jest.fn(),
}));

jest.mock('@/lib/wagmi', () => ({
  contractHelpers: {
    getOpenMatches: jest.fn(),
    getMatch: jest.fn(),
  },
}));

describe('useOpenMatchesWithFixtures', () => {
  it('should return empty matches when no open matches exist', () => {
    const { result } = renderHook(() => useOpenMatchesWithFixtures());
    
    expect(result.current.matches).toEqual([]);
    expect(result.current.openMatchesCount).toBe(0);
  });

  it('should handle loading state correctly', () => {
    const { result } = renderHook(() => useOpenMatchesWithFixtures());
    
    expect(result.current.isLoading).toBeDefined();
    expect(result.current.error).toBeDefined();
  });
});
