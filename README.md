# Padel Tool

A script to sign up for selected Padel classes and events in tri-city locations using the kluby.org website.

> ⚠️ Immediately payable events supported only through club wallets.

## Used tech

-   puppeteer - web scraping
-   node.js - executing scripts
-   firebase - storing data with rules for the desired classes
-   docker - deployment, containerization

## Supported Rule schema

```typescript
{
    enabled: boolean | string, // It supports string as a Date in YYYY-MM-DD format. The date indicates when the rule becomes active.
    multi: boolean, // Optional, default = false
    conditions: {
        dayOfWeek: number | number[],
        place: string,
        titlePatterns: (string | {negated: boolean; pattern: string})[],
        timeSlot: {start: string; end: string} // Optional - string format hh:mm[:ss]
    }
}
```
