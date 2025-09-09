import { DisplayStyle, RankOption, BehaviorOption } from '../../types';
import { __ } from '@wordpress/i18n';

export const displayStyles: DisplayStyle[] = [
  {
    value: 'grid-single',
    label: __('Single Column Grid', 's2j-alliance-manager'),
    description: __('Display alliance banners in a single column layout', 's2j-alliance-manager')
  },
  {
    value: 'grid-multi',
    label: __('Multi Column Grid', 's2j-alliance-manager'),
    description: __('Display alliance banners in a responsive multi-column grid', 's2j-alliance-manager')
  }
  // Masonry Layout will be available in pro version
  // {
  //   value: 'masonry',
  //   label: __('Masonry Layout', 's2j-alliance-manager'),
  //   description: __('Display alliance banners in a masonry (Pinterest-style) layout', 's2j-alliance-manager')
  // }
];

export const rankOptions: RankOption[] = [
  { value: 'gold', label: __('Gold', 's2j-alliance-manager') },
  { value: 'silver', label: __('Silver', 's2j-alliance-manager') },
  { value: 'bronze', label: __('Bronze', 's2j-alliance-manager') },
  { value: 'platinum', label: __('Platinum', 's2j-alliance-manager') },
  { value: 'default', label: __('Default', 's2j-alliance-manager') }
];

export const behaviorOptions: BehaviorOption[] = [
  {
    value: 'jump',
    label: __('Jump to URL', 's2j-alliance-manager'),
    description: __('Clicking the logo will navigate to the specified URL', 's2j-alliance-manager')
  },
  {
    value: 'modal',
    label: __('Show Modal', 's2j-alliance-manager'),
    description: __('Clicking the logo will show a modal with the specified message', 's2j-alliance-manager')
  }
];
