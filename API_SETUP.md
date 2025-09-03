# API Setup for Finance Dashboard

## Required Environment Variables

Create a `.env` file in the root directory with the following:

```bash
# Indian API Key (for stock.indianapi.in)
NEXT_PUBLIC_INDIANAPI_KEY=your_indian_api_key_here
```

## API Endpoints

### Indian API (stock.indianapi.in)
- **Base URL**: `https://stock.indianapi.in/trending`
- **Authentication**: API key as query parameter (`?apikey=YOUR_KEY`)
- **Rate Limit**: For Indian API, It is 500/month
- **Data Format**: JSON with trending stocks data: consist of top_gainer and top_loser

### Other APIs
- **Authentication**: API key in headers (`X-Api-Key`)
- **Rate Limit**: For the other, I have not look after. I tries to implement all possible with this API alone


## Refresh Functionality

The dashboard automatically refreshes data based on the refresh interval set for each widget:
- **Minimum**: 5 seconds
- **Maximum**: 300 seconds (5 minutes)
- **Cache**: 30 seconds to prevent excessive API calls
