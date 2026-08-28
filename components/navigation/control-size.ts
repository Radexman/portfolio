export type ControlSize = 'md' | 'lg'

// Shared dimensions for the circular controls that appear in both nav layers.
// `lg` is the 44px minimum hit target and the default everywhere.
export const CONTROL_SIZES: Record<ControlSize, { button: string; icon: string }> = {
  md: { button: 'size-10', icon: 'size-4' },
  lg: { button: 'size-11', icon: 'size-4.5' },
}
