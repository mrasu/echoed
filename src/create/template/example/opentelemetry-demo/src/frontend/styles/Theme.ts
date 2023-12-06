// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import { DefaultTheme } from 'styled-components';

const Theme: DefaultTheme = {
  colors: {
    otelBlue: '#5262A8',
    otelYellow: '#EAAA3B',
    otelGray: '#403F4B',
    otelRed: '#FB7181',
    backgroundGray: 'rgba(64, 63, 75, 0.1)',
    lightBorderGray: 'rgba(82, 98, 168, 0.3)',
    borderGray: '#2E2437',
    textGray: '#29293E',
    textLightGray: '#78788C',
    white: '#FFFFFF',
  },
  breakpoints: {
    desktop: '@media (min-width: 768px)',
  },
  sizes: {
    mxLarge: '22px',
    mLarge: '20px',
    mMedium: '14px',
    mSmall: '12px',
    dxLarge: '58px',
    dLarge: '40px',
    dMedium: '18px',
    dSmall: '16px',
    nano: '8px',
  },
  fonts: {
    bold: '800',
    regular: '500',
    semiBold: '700',
    light: '400',
  },
};

export default Theme;
