# Team Logo Integration

This document explains how team logos are integrated into the BaseLeague application.

## Overview

The team logo system provides high-quality Premier League team logos for fixtures, enhancing the visual experience of the application.

## Architecture

### 1. Team Logo Service (`src/services/teamLogos.ts`)

The core service that manages team logo URLs and caching:

- **Primary Source**: Official Premier League badge URLs
- **Fallback Sources**: Alternative logo providers
- **Caching**: In-memory cache to avoid repeated requests
- **Error Handling**: Graceful fallback to placeholder images

### 2. Team Logo Hook (`src/hooks/useTeamLogos.ts`)

React hook for easy integration:

```typescript
const { getTeamLogo, preloadLogos, isLoading } = useTeamLogos();

// Get logo URL
const logoUrl = getTeamLogo(teamId, teamName);

// Preload multiple logos
await preloadLogos(['12', '14', '13']); // Liverpool, Man Utd, Man City
```

### 3. Logo Preloader (`src/utils/logoPreloader.ts`)

Utility for performance optimization:

- **Automatic Preloading**: Preloads logos when fixtures are loaded
- **Common Teams**: Preloads popular teams on app startup
- **Background Loading**: Non-blocking logo loading

## Logo Sources

### Primary Source: Premier League Official
```
https://resources.premierleague.com/premierleague/badges/50/t{teamId}.png
```

### Fallback Sources
- Alternative CDN providers
- Placeholder images for unknown teams

## Supported Teams

| Team ID | Team Name | Logo URL |
|---------|-----------|----------|
| 1 | Arsenal | t1.png |
| 2 | Aston Villa | t2.png |
| 3 | Bournemouth | t3.png |
| 4 | Brentford | t4.png |
| 5 | Brighton | t5.png |
| 6 | Chelsea | t6.png |
| 7 | Crystal Palace | t7.png |
| 8 | Everton | t8.png |
| 9 | Fulham | t9.png |
| 10 | Leeds | t10.png |
| 11 | Leicester | t11.png |
| 12 | Liverpool | t12.png |
| 13 | Manchester City | t13.png |
| 14 | Manchester United | t14.png |
| 15 | Newcastle | t15.png |
| 16 | Nottingham Forest | t16.png |
| 17 | Southampton | t17.png |
| 18 | Tottenham | t18.png |
| 19 | West Ham | t19.png |
| 20 | Wolves | t20.png |

## Usage Examples

### Basic Usage
```typescript
import { useTeamLogos } from '@/hooks/useTeamLogos';

const MyComponent = () => {
  const { getTeamLogo } = useTeamLogos();
  
  const logoUrl = getTeamLogo('12', 'Liverpool');
  
  return (
    <img 
      src={logoUrl} 
      alt="Liverpool" 
      className="w-8 h-8"
      onError={(e) => {
        e.target.src = 'https://via.placeholder.com/32x32/1f2937/ffffff?text=?';
      }}
    />
  );
};
```

### With Preloading
```typescript
import { useTeamLogos } from '@/hooks/useTeamLogos';
import { preloadTeamLogos } from '@/utils/logoPreloader';

const MyComponent = () => {
  const { getTeamLogo, preloadLogos } = useTeamLogos();
  
  useEffect(() => {
    // Preload logos for better performance
    preloadLogos(['12', '14', '13']);
  }, []);
  
  // ... rest of component
};
```

## Performance Features

### 1. Caching
- In-memory cache prevents repeated requests
- Cache persists during app session
- Automatic cache invalidation

### 2. Preloading
- Background loading of common team logos
- Non-blocking image preloading
- Automatic preloading when fixtures load

### 3. Error Handling
- Graceful fallback to placeholder images
- Retry mechanism for failed loads
- Console warnings for debugging

## Integration Points

### Dashboard Component
- Team logos in match cards
- Automatic preloading when fixtures load
- Error handling with fallback images

### CreateMatch Component
- Team logos in fixture cards
- Logo display in team vs team layout
- Modal integration with logo support

### MatchCard Component
- Team logos in match displays
- Consistent logo sizing and styling
- Error handling for missing logos

## Future Enhancements

1. **Dynamic Logo Updates**: Real-time logo updates from API
2. **Custom Team Support**: Support for non-Premier League teams
3. **Logo Caching**: Persistent cache across app sessions
4. **Logo Optimization**: WebP format support for better performance
5. **Logo Analytics**: Track logo load performance and errors

## Troubleshooting

### Common Issues

1. **Missing Logos**: Check team ID mapping in service
2. **Slow Loading**: Enable preloading for better performance
3. **Broken Images**: Verify logo URL accessibility
4. **Cache Issues**: Clear browser cache or restart app

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('debug-logos', 'true');
```

This will log all logo requests and cache hits to the console.
