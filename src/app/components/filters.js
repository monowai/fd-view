export function contains() {
  return (array, element) => {
    return array.includes(element);
  };
}

export function notEmpty() {
  return obj => {
    return Object.keys(obj).length !== 0;
  };
}

export function megaNum() {
  return (number, fractionSize) => {
    if (number === null) {
      return null;
    }
    if (number === 0) {
      return '0';
    }

    if (!fractionSize || fractionSize < 0) {
      fractionSize = 1;
    }

    let abs = Math.abs(number);
    const rounder = Math.pow(10, fractionSize);
    const isNegative = number < 0;
    let key = '';
    const powers = [
      {key: 'Q', value: Math.pow(10, 15)},
      {key: 'T', value: Math.pow(10, 12)},
      {key: 'B', value: Math.pow(10, 9)},
      {key: 'M', value: Math.pow(10, 6)},
      {key: 'k', value: 1000}
    ];

    for (let i = 0; i < powers.length; i++) {
      let reduced = abs / powers[i].value;

      reduced = Math.round(reduced * rounder) / rounder;

      if (reduced >= 1) {
        abs = reduced;
        key = powers[i].key;
        break;
      }
    }

    return (isNegative ? '-' : '') + abs + key;
  };
}
