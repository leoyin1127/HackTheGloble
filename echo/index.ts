// Import polyfills first
import 'react-native-url-polyfill/auto';

// Import React Native components
import { AppRegistry } from 'react-native';
import App from './App';

// Register the app component
AppRegistry.registerComponent('main', () => App);

// Export the app component
export default App;
