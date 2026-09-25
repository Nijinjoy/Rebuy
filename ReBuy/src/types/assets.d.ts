// Lets TypeScript accept image imports; Metro turns them into asset ids.
declare module '*.png' {
  import type { ImageSourcePropType } from 'react-native';
  const source: ImageSourcePropType;
  export default source;
}
