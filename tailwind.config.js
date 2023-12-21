/* eslint-disable */
module.exports = {
  content: ['./src/**/*.tsx'],
  options: {
    safelist: ['nav-item', 'nav-link', 'tab-content', 'tab-pane'],
  },
  theme: {
    colors: {
      // Base
      transparent: 'rgb(0,0,0,0)',
      transparentw: 'rgb(255,255,255,0)',
      current: 'currentColor',
      black: 'rgb(0,0,0)',
      white: 'rgb(255,255,255)',
      surface: 'rgb(var(--color-surface) / <alpha-value>)',
      highlight: 'rgb(var(--color-highlight) / <alpha-value>)',
      gray: {
        1: 'rgb(var(--color-gray-1) / <alpha-value>)',
        5: 'rgb(var(--color-gray-5) / <alpha-value>)',
        10: 'rgb(var(--color-gray-10) / <alpha-value>)',
        20: 'rgb(var(--color-gray-20) / <alpha-value>)',
        30: 'rgb(var(--color-gray-30) / <alpha-value>)',
        40: 'rgb(var(--color-gray-40) / <alpha-value>)',
        50: 'rgb(var(--color-gray-50) / <alpha-value>)',
        60: 'rgb(var(--color-gray-60) / <alpha-value>)',
        70: 'rgb(var(--color-gray-70) / <alpha-value>)',
        80: 'rgb(var(--color-gray-80) / <alpha-value>)',
        90: 'rgb(var(--color-gray-90) / <alpha-value>)',
        100: 'rgb(var(--color-gray-100) / <alpha-value>)',
      },

      // Colors
      primary: 'rgb(var(--color-primary) / <alpha-value>)',
      'primary-dark': 'rgb(var(--color-primary-dark) / <alpha-value>)',
      red: 'rgb(var(--color-red) / <alpha-value>)',
      'red-dark': 'rgb(var(--color-red-dark) / <alpha-value>)',
      orange: 'rgb(var(--color-orange) / <alpha-value>)',
      'orange-dark': 'rgb(var(--color-orange-dark) / <alpha-value>)',
      yellow: 'rgb(var(--color-yellow) / <alpha-value>)',
      'yellow-dark': 'rgb(var(--color-yellow-dark) / <alpha-value>)',
      green: 'rgb(var(--color-green) / <alpha-value>)',
      'green-dark': 'rgb(var(--color-green-dark) / <alpha-value>)',
      pink: 'rgb(var(--color-pink) / <alpha-value>)',
      'pink-dark': 'rgb(var(--color-pink-dark) / <alpha-value>)',
      indigo: 'rgb(var(--color-indigo) / <alpha-value>)',
      'indigo-dark': 'rgb(var(--color-indigo-dark) / <alpha-value>)',

      // Suplemental colors
      'pcComponentes-orange': '#F26122',
    },
    screens: {
      xs: '512px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      dropShadow: {
        soft: '0 6px 12px rgba(0, 0, 0, 0.04)',
        tooltip: ['0px 12px 24px rgba(0,0,0,0.12)', '0px 0px 1px rgba(0,0,0,0.16)'],
      },
      opacity: {
        0: '0',
        1: '.01',
        2: '.02',
        3: '.03',
        4: '.04',
        5: '.05',
        6: '.06',
        7: '.07',
        8: '.08',
        9: '.09',
        10: '.1',
        15: '.15',
        20: '.2',
        25: '.25',
        30: '.3',
        35: '.35',
        40: '.4',
        45: '.45',
        50: '.5',
        55: '.55',
        60: '.6',
        65: '.65',
        70: '.7',
        75: '.75',
        80: '.8',
        85: '.85',
        90: '.9',
        95: '.95',
        100: '1',
      },
      rotate: {
        10: '10deg',
        30: '30deg',
      },
      transitionDuration: {
        50: '50ms',
        250: '250ms',
      },
      width: {
        activity: '296px',
        driveNameHeader: '364px',
        date: '220px',
        breadcrumb: 'min(128px, 2ch)',
        size: '96px',
        '0.5/12': '4.166667%',
      },
      minWidth: {
        104: '26rem',
        activity: '296px',
        driveNameHeader: '364px',
        date: '200px',
        breadcrumb: 'min(128px, 2ch)',
      },
      borderWidth: {
        3: '3px',
      },
      ringOpacity: (theme) => ({
        DEFAULT: '0.5',
        ...theme('opacity'),
      }),
      backgroundOpacity: (theme) => ({
        ...theme('opacity'),
      }),
      ringWidth: {
        DEFAULT: '3px',
        0: '0px',
        1: '1px',
        2: '2px',
        3: '3px',
        4: '4px',
        8: '8px',
      },
      borderRadius: {
        px: '1px',
        '1/2': '50%',
      },
      fontSize: {
        'supporting-2': '0.625rem', // 10px
      },
      spacing: {
        50: '12.7rem',
        104: '26rem',
        112: '28rem',
        120: '30rem',
        156: '37.5rem',
      },
      maxWidth: {
        xxxs: '220px',
        xxs: '280px',
        '3.5xl': '800px',
      },
      scale: {
        0: '0',
        50: '.5',
        55: '.55',
        60: '.60',
        65: '.65',
        70: '.70',
        75: '.75',
        80: '.80',
        85: '.85',
        90: '.90',
        95: '.95',
        96: '.96',
        97: '.97',
        98: '.98',
        99: '.99',
        100: '1',
        105: '1.05',
        110: '1.1',
        125: '1.25',
      },
      boxShadow: {
        b: '2px 1px 3px 0 rgba(0,0,0,0.1),2px 1px 2px 0 rgba(0,0,0,0.06)',
        'photo-select': '0px 12px 24px rgba(0, 0, 0, 0.16)',
        soft: '0px 4px 8px rgba(0, 0, 0, 0.02), 0px 8px 16px rgba(0, 0, 0, 0.02), 0px 12px 20px rgba(0, 0, 0, 0.02), 0px 16px 24px rgba(0, 0, 0, 0.02), 0px 24px 32px rgba(0, 0, 0, 0.02);',
        subtle: '0 32px 40px 0 rgba(18, 22, 25, 0.04)',
        'subtle-hard': '0 32px 40px 0 rgba(18, 22, 25, 0.08)',
      },
    },
    transitionDuration: {
      DEFAULT: '150ms',
      0: '0ms',
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      250: '250ms',
      300: '300ms',
      350: '350ms',
      400: '400ms',
      450: '450ms',
      500: '500ms',
      550: '550ms',
      600: '600ms',
      650: '650ms',
      700: '700ms',
      750: '750ms',
      800: '800ms',
      850: '850ms',
      900: '900ms',
      950: '950ms',
      1000: '1000ms',
    },
  },
  plugins: [
    function ({ addBase, theme }) {
      function extractColorVars(colorObj, colorGroup = '') {
        return Object.keys(colorObj).reduce((vars, colorKey) => {
          const value = colorObj[colorKey];

          const newVars =
            typeof value === 'string'
              ? { [`--color${colorGroup}-${colorKey}`]: value }
              : extractColorVars(value, `-${colorKey}`);

          return { ...vars, ...newVars };
        }, {});
      }

      addBase({
        ':root': extractColorVars(theme('colors')),
      });
    },
  ],
};
