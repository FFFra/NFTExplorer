# NFT Explorer

A modern mobile application built with React Native and Expo that allows users to explore NFTs on the Avalanche blockchain.

<p align="center">
  <img src="https://i.imgur.com/YourNFTExplorerDemoGif.gif" alt="NFT Explorer Demo" width="300" />
</p>

## Design

### iOS


https://github.com/user-attachments/assets/377ac567-c327-4d6d-9b0e-53a2e69f43b4


### Android


https://github.com/user-attachments/assets/a18f7f9e-343b-46e8-95bc-4e909447b213


## Features

- **Stunning UI**: Beautiful, responsive, and modern user interface with smooth animations
- **Grid and List Views**: View NFTs in either grid or list views with an adjustable number of columns
- **Skeleton Loading**: Beautiful loading states that provide a better user experience
- **Pull to Refresh**: Refresh content with a simple pull-down gesture
- **Infinite Scrolling**: Load more NFTs as you scroll down
- **Detailed NFT View**: Detailed information about each NFT with interactive elements
- **Error Handling**: Graceful error handling with fallbacks to ensure uninterrupted browsing
- **Mock Data**: Seamless fallback to mock data when API returns empty results or errors

## Notes

- The application includes mockNft data that renders random images for design testing purposes. This feature is particularly useful for design and experience tests, allowing developers to evaluate the UI with various image types without relying on actual API responses.


## Technologies Used

- **React Native**: Core framework for building the mobile application
- **Expo**: Development platform for creating and deploying React Native apps
- **React Navigation**: Navigation library for moving between screens
- **React Native Reanimated**: Advanced animations library
- **Context API**: For global state management
- **Custom Hooks**: For shared functionality and logic
- **Typescript**: For type-safe code


## Architecture

The application follows a clean architecture pattern with proper separation of concerns:

### Core Directories

- **`src/api`**: API services for fetching NFT data
- **`src/components`**: Reusable UI components
- **`src/context`**: Global state management using Context API
- **`src/hooks`**: Custom hooks for shared logic
- **`src/navigation`**: Navigation configuration
- **`src/screens`**: Main application screens
- **`src/types`**: TypeScript type definitions
- **`src/utils`**: Utility functions and helpers

### Key Design Patterns

1. **Context API for State Management**:
   - The application uses React Context API for managing global state
   - The NFT context provides data and operations related to NFTs

2. **Helper Functions**:
   - Utility functions are organized in dedicated helper files
   - Image processing, layout calculations, and other utilities are centralized

3. **Component Structure**:
   - Components are designed to be reusable and self-contained
   - Each component has its own styles and logic

4. **Mock Data Handling**:
   - The application gracefully falls back to mock data when API requests fail
   - This ensures a good user experience even with connectivity issues

## Getting Started

### Prerequisites

- Node.js (>= 14.0.0)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/FFFra/NFTExplorer.git
   cd NFTExplorer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npx expo start
   ```

4. Follow the instructions in the terminal to open the app on your device or emulator.

## Usage

### Home Screen

- **Toggle View Mode**: Tap the grid/list icon to switch between grid and list views
- **Adjust Columns**: Tap the number icon to cycle through different column counts
- **Load More**: Scroll down to load more NFTs
- **Refresh**: Pull down to refresh the NFT list

### Detail Screen

- **Zoom Image**: Tap the image to zoom in/out
- **Share**: Use the share button to share the NFT with others
- **View Details**: Scroll down to see detailed information about the NFT

## API Integration

The application integrates with the Avalanche blockchain API to fetch real NFT data. When no data is available or errors occur, the app falls back to mock data to ensure a smooth user experience.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Avalanche](https://www.avax.network/) for the blockchain API
- [Expo](https://expo.dev/) for the development platform
- [React Native](https://reactnative.dev/) for the framework
- [Lorem Picsum](https://picsum.photos/) for placeholder images
