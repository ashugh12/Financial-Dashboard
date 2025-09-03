# FibBoard
Thanks to Groww for providing me to use my technical skill to build.

Simple Customizable, finance dashboard, where user can build their own realtime finance monitoring. They can connect to various API and display their real-time data.

We have focused only on https://stock.indianapi.in/trending and [https://stock.indianapi.in/commodities](https://stock.indianapi.in/commodities). I choose seamless integration with single api and focus on the other aspect such as drag and drop functionality. Also I have focused to implement robust state management and data persistence in term of cache.




##Folder structure and Architecture


## Technologies I choose from the give one
- FrontEnd FrameWork: Next.js 
- Styling: Tailwind CSS
- State management: Zustand (why? Zustand creates a standalone store that can be used directly without wrapping app in <Provider>, less bundle size and good for small and medium app)

## Features

### **Widget Management**
- Create, edit, and delete finance widgets (use state management to prevent ambiguous deleate, editig)
- Support for Card, Table
- Drag and drop to rearrange widgets
- Custom refresh intervals (Range5-300 seconds, 1s: 1000ms so it someone write 3600 it is in second and equivalent to 1 min) 

### **Theme System**
- Dark/Light theme toggle(Use the theme store to maintain the state and toogle the theme everywhere )
- Persistent theme preference (Use the assignment pdf screenshot to get inspiration to keep persistent theme)
- Smooth transitions between themes(Use )

### **Data Visualization**
- **Card Mode**: Company data in compact cards with company name, and data points
- **Table Mode**: Structured data tables with row and column

### 🔄 **Smart Caching**
- **Widget Persistence**: Cards remain after page refresh(Store into local storage)
- **API Response Caching**: 30-second cache to prevent excessive API calls(store into the local storage)

## Caching Features

### **Automatic Caching**
- Widget configurations are automatically saved to localStorage
- API responses are cached to reduce API calls
- Cache expiration based on refresh intervals

### **Cache Indicators**
- 📦 Blue box shows when using cached data
- Cache status displayed in header
- Clear cache button to reset all cached data

### **Cache Benefits**
- **Faster Loading**: Cached data loads instantly
- **Reduced API Calls**: Prevents rate limiting(Suprisingly for this assignment already I have used 250 plus credits out of 500 credit quota)
- **Persistent Layout**: Widgets remain after browser refresh

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create `.env.local` file:
   ```bash
   NEXT_PUBLIC_INDIANAPI_KEY=your_api_key_here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Usage

### **Creating Widgets**
1. Click "+ Add Widget"
2. Enter widget name and API URL
3. Test API connection
4. Select display mode (Card/Table/Chart)
5. Choose fields to display
6. Set refresh interval


### **Theme Toggle**
- Click ☀️/🌙 button to switch themes
- Theme preference is automatically saved


## Technical Details

- **Framework**: Next.js 14
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Caching**: localStorage with expiration
- **Theme**: CSS-in-JS with Tailwind

## Troubleshooting

### **Cache Issues**
- Clear cache if widgets show old data
- Check browser console for cache logs
- Verify localStorage is enabled
