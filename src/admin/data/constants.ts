import { DisplayStyle, RankOption, BehaviorOption } from '../../types';

export const displayStyles: DisplayStyle[] = [
  {
    value: 'grid-single',
    label: 'Single Column Grid',
    description: 'Display alliance banners in a single column layout'
  },
  {
    value: 'grid-multi',
    label: 'Multi Column Grid',
    description: 'Display alliance banners in a responsive multi-column grid'
  },
  {
    value: 'masonry',
    label: 'Masonry Layout',
    description: 'Display alliance banners in a masonry (Pinterest-style) layout'
  }
];

export const rankOptions: RankOption[] = [
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'default', label: 'Default' }
];

export const behaviorOptions: BehaviorOption[] = [
  {
    value: 'jump',
    label: 'Jump to URL',
    description: 'Clicking the logo will navigate to the specified URL'
  },
  {
    value: 'modal',
    label: 'Show Modal',
    description: 'Clicking the logo will show a modal with the specified message'
  }
];
