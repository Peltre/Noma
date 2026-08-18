// Theme hook. Kept as a hook (instead of importing the theme constant
// directly everywhere) so call sites don't need to change if a real
// preference ever lives here again — right now it just hands back the
// single Medianoche theme.
import { theme } from '../constants/themes';

export function useTheme() {
    return { theme };
}