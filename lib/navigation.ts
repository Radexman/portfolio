import type { IconName } from '@/components/icons'

export interface NavItem {
  id: string
  label: string
  icon: IconName
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'hero', label: 'Home', icon: 'house' },
  { id: 'work', label: 'Selected work', icon: 'briefcase' },
  { id: 'timeline', label: 'Career', icon: 'git-branch' },
  { id: 'teaching', label: 'Teaching', icon: 'graduation-cap' },
  { id: 'skills', label: 'Stack', icon: 'braces' },
  { id: 'more-work', label: 'More work', icon: 'layout-grid' },
  { id: 'beekeeping', label: 'Side project', icon: 'sprout' },
  { id: 'contact', label: 'Contact', icon: 'send' },
]
