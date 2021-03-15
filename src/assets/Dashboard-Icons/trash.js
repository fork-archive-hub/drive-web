import React from 'react';

const SVG = ({
  defaultColors = {},
  color = '#4385F4',
  width = 10,
  height = 10
}) => {
  // Use default colors if none hex color is set
  color = color.startsWith('#') ? color : defaultColors[color];
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 27 20">
      <path
        fill={color}
        d="M11.6123779,19.0287421 L11.3317165,19.0287421 L11.3158368,19.0210176 L11.0932992,19.0210176 L9.95346673,19.0210176 L5.0463006,19.0210176 C2.23685435,18.8661146 -5.40012479e-12,16.2434469 -5.40012479e-12,13.4017785 C-5.40012479e-12,11.4414545 1.06491391,9.73218029 2.64355514,8.8081039 C2.49906933,8.41817571 2.42415077,8.00154011 2.42415077,7.56353858 C2.42415077,5.56048281 4.04560261,3.94201375 6.05234993,3.94201375 C6.48580735,3.94201375 6.9032108,4.0167945 7.29385761,4.16101451 C8.45509539,1.70393277 10.9595161,0 13.8706375,0 C17.6379711,0.00534148205 20.7417403,2.88440031 21.0949279,6.55399847 C23.9899953,7.0507563 26.1893904,9.72683881 26.1893904,12.7554591 C26.1893904,15.9923972 23.6635644,18.7966753 20.4634714,19.0210176 L16.2305724,19.0210176 L15.0907399,19.0210176 L14.9702201,19.0210176 L14.9652385,19.0287421 L14.6091205,19.0287421 L14.6091205,13.8410952 C15.759462,13.7952122 16.6824417,13.7011772 16.8254724,13.5675352 C17.2272283,13.1923479 13.6261885,7.56709957 13.1158215,7.56709957 C12.6056654,7.56709957 8.9369282,13.1295213 9.40617057,13.5675352 C9.57050906,13.7210748 10.4812213,13.8130803 11.6123779,13.8516845 L11.6123779,19.0287421 Z" transform="translate(.078 .59)"/>
    </svg>
  );
};

export default SVG;