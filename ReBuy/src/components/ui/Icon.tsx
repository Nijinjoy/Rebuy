import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'explore'
  | 'search'
  | 'sell'
  | 'chats'
  | 'profile'
  | 'cart'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'menu'
  | 'logout'
  | 'back'
  | 'camera'
  | 'send'
  | 'image'
  | 'close'
  | 'heart'
  | 'package'
  | 'mapPin'
  | 'chevronRight'
  | 'chevronDown'
  | 'tag'
  | 'percent'
  | 'bell'
  | 'shield'
  | 'help'
  | 'locate'
  | 'building'
  | 'filter'
  | 'sort'
  | 'mail'
  | 'lock';

type Props = {
  name: IconName;
  color: string;
  size?: number;
  // Fills the shape, e.g. a solid heart for saved items.
  fill?: string;
};

// Outline icons adapted from Lucide (ISC license), drawn on a 24×24 grid.
function Icon({ name, color, size = 24, fill = 'none' }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === 'home' && (
        <>
          <Path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        </>
      )}
      {name === 'explore' && (
        <>
          <Circle cx={12} cy={12} r={10} />
          <Path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
        </>
      )}
      {name === 'search' && (
        <>
          <Circle cx={11} cy={11} r={8} />
          <Path d="m21 21-4.3-4.3" />
        </>
      )}
      {name === 'sell' && (
        <>
          <Circle cx={12} cy={12} r={10} />
          <Path d="M8 12h8" />
          <Path d="M12 8v8" />
        </>
      )}
      {name === 'chats' && <Path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />}
      {name === 'profile' && (
        <>
          <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <Circle cx={12} cy={7} r={4} />
        </>
      )}
      {name === 'cart' && (
        <>
          <Circle cx={8} cy={21} r={1} />
          <Circle cx={19} cy={21} r={1} />
          <Path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </>
      )}
      {name === 'plus' && (
        <>
          <Path d="M5 12h14" />
          <Path d="M12 5v14" />
        </>
      )}
      {name === 'minus' && <Path d="M5 12h14" />}
      {name === 'trash' && (
        <>
          <Path d="M3 6h18" />
          <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </>
      )}
      {name === 'menu' && (
        <>
          <Path d="M4 6h16" />
          <Path d="M4 12h16" />
          <Path d="M4 18h16" />
        </>
      )}
      {name === 'logout' && (
        <>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Path d="m16 17 5-5-5-5" />
          <Path d="M21 12H9" />
        </>
      )}
      {name === 'back' && (
        <>
          <Path d="m12 19-7-7 7-7" />
          <Path d="M19 12H5" />
        </>
      )}
      {name === 'camera' && (
        <>
          <Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <Circle cx={12} cy={13} r={3} />
        </>
      )}
      {name === 'send' && (
        <>
          <Path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
          <Path d="M6 12h16" />
        </>
      )}
      {name === 'image' && (
        <>
          <Rect x={3} y={3} width={18} height={18} rx={2} />
          <Circle cx={9} cy={9} r={2} />
          <Path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </>
      )}
      {name === 'heart' && (
        <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      )}
      {name === 'package' && (
        <>
          <Path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
          <Path d="M12 22V12" />
          <Path d="m3.3 7 8.7 5 8.7-5" />
          <Path d="m7.5 4.27 9 5.15" />
        </>
      )}
      {name === 'mapPin' && (
        <>
          <Path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <Circle cx={12} cy={10} r={3} />
        </>
      )}
      {name === 'chevronRight' && <Path d="m9 18 6-6-6-6" />}
      {name === 'chevronDown' && <Path d="m6 9 6 6 6-6" />}
      {name === 'tag' && (
        <>
          <Path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
          <Circle cx={7.5} cy={7.5} r={0.5} />
        </>
      )}
      {name === 'percent' && (
        <>
          <Path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <Path d="m15 9-6 6" />
          <Path d="M9 9h.01" />
          <Path d="M15 15h.01" />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path d="M10.268 21a2 2 0 0 0 3.464 0" />
          <Path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
        </>
      )}
      {name === 'shield' && (
        <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      )}
      {name === 'locate' && (
        <>
          <Path d="M2 12h3" />
          <Path d="M19 12h3" />
          <Path d="M12 2v3" />
          <Path d="M12 19v3" />
          <Circle cx={12} cy={12} r={7} />
          <Circle cx={12} cy={12} r={3} />
        </>
      )}
      {name === 'help' && (
        <>
          <Circle cx={12} cy={12} r={10} />
          <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <Path d="M12 17h.01" />
        </>
      )}
      {name === 'building' && (
        <>
          <Path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
          <Path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
          <Path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
          <Path d="M10 6h4" />
          <Path d="M10 10h4" />
          <Path d="M10 14h4" />
          <Path d="M10 18h4" />
        </>
      )}
      {name === 'filter' && (
        <>
          <Path d="M21 4h-7" />
          <Path d="M10 4H3" />
          <Path d="M21 12h-9" />
          <Path d="M8 12H3" />
          <Path d="M21 20h-5" />
          <Path d="M12 20H3" />
          <Path d="M14 2v4" />
          <Path d="M8 10v4" />
          <Path d="M16 18v4" />
        </>
      )}
      {name === 'sort' && (
        <>
          <Path d="m21 16-4 4-4-4" />
          <Path d="M17 20V4" />
          <Path d="m3 8 4-4 4 4" />
          <Path d="M7 4v16" />
        </>
      )}
      {name === 'mail' && (
        <>
          <Rect x={2} y={4} width={20} height={16} rx={2} />
          <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </>
      )}
      {name === 'lock' && (
        <>
          <Rect x={3} y={11} width={18} height={11} rx={2} />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      )}
      {name === 'close' && (
        <>
          <Path d="M18 6 6 18" />
          <Path d="m6 6 12 12" />
        </>
      )}
    </Svg>
  );
}

export default Icon;
