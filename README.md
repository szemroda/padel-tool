# Padel Tool

A script to sign up for selected Padel classes and events in tri-city locations using the kluby.org website.

## Used tech

- puppeteer - web scraping
- node.js - executing scripts
- firebase - storing data with rules for the desired classes
- docker - deployment, containerization

## Supported Rule schema

```typescript
{
    enabled: boolean,
    conditions: {
        dayOfWeek: number,
        place: string,
        titlePatterns: string[],
        descriptionPatterns: string[], // Optional
    }
}
```
