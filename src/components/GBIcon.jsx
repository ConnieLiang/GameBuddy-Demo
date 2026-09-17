import paths from './gbIconPaths.json';

// Canonical GB SVG geometry; caller controls semantic color and accessible label.
export default function GBIcon({name, size=24, strokeWidth, className='', ...props}) {
  if (!paths[name]) throw new Error(`Unknown GB icon: ${name}`);
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className={`gb-icon ${className}`} {...props} dangerouslySetInnerHTML={{__html:paths[name]}}/>;
}

export const ChevronLeft = props => <GBIcon name="gobackward" {...props}/>;
export const ArrowLeft = props => <GBIcon name="gobackward" {...props}/>;
export const ChevronRight = props => <GBIcon name="goforward" {...props}/>;
export const ChevronDown = props => <GBIcon name="expand" {...props}/>;
export const Check = props => <GBIcon name="checkmark" {...props}/>;
export const Search = props => <GBIcon name="search" {...props}/>;
export const Image = props => <GBIcon name="camera" {...props}/>;
export const Images = props => <GBIcon name="camera" {...props}/>;
export const Mic = props => <GBIcon name="microphone" {...props}/>;
export const MessageSquare = props => <GBIcon name="chat" {...props}/>;
export const MessageSquareOff = props => <GBIcon name="chat" {...props}/>;
export const Lightbulb = props => <GBIcon name="coaching" {...props}/>;
export const Gamepad2 = props => <GBIcon name="home-before" {...props}/>;
export const Layers = props => <GBIcon name="video" {...props}/>;
export const Trash2 = props => <GBIcon name="delete" {...props}/>;
export const Plus = props => <GBIcon name="add" {...props}/>;
export const Play = props => <GBIcon name="play" {...props}/>;
export const Square = props => <GBIcon name="stop" {...props}/>;
export const X = props => <GBIcon name="close" {...props}/>;
export const Pencil = props => <GBIcon name="edit" {...props}/>;
export const UsersRound = props => <GBIcon name="squad" {...props}/>;
export const Sparkles = props => <GBIcon name="ai-polish" {...props}/>;
export const AudioLines = props => <GBIcon name="voice-activity" {...props}/>;
export const Brain = props => <GBIcon name="memory" {...props}/>;
export const RotateCcw = props => <GBIcon name="refresh" {...props}/>;
export const RotateCw = props => <GBIcon name="refresh" {...props}/>;
export const RefreshCw = props => <GBIcon name="refresh" {...props}/>;
export const Settings = props => <GBIcon name="settings" {...props}/>;
export const Bot = props => <GBIcon name="agent" {...props}/>;
export const Captions = props => <GBIcon name="chat" {...props}/>;
export const SlidersHorizontal = props => <GBIcon name="customize" {...props}/>;
export const FileText = props => <GBIcon name="guide" {...props}/>;
export const ShieldCheck = props => <GBIcon name="privacy" {...props}/>;
export const HardDrive = props => <GBIcon name="storage" {...props}/>;
export const KeyRound = props => <GBIcon name="privacy" {...props}/>;
export const Activity = props => <GBIcon name="check-circle" {...props}/>;
export const Copy = props => <GBIcon name="copy" {...props}/>;
export const Share2 = props => <GBIcon name="share" {...props}/>;
export const ArrowUp = props => <GBIcon name="send" {...props}/>;
export const Support = props => <GBIcon name="support" {...props}/>;
export const Guide = props => <GBIcon name="guide" {...props}/>;
