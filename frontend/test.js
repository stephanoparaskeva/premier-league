function numberToWords(input) {
  // Remove commas if present in input
  const numStr = typeof input === 'string' ? input.replace(/,/g, '') : String(input);
  const num = parseInt(numStr, 10);

  if (isNaN(num)) {
    throw new Error('Invalid input: not a valid number');
  }

  if (num === 0) return 'zero';

  // Handle negative numbers
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
    'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const scales = [
    { name: 'quintillion', value: 1000000000000000000n },
    { name: 'quadrillion', value: 1000000000000000n },
    { name: 'trillion', value: 1000000000000n },
    { name: 'billion', value: 1000000000n },
    { name: 'million', value: 1000000n },
    { name: 'thousand', value: 1000n }
  ];

  function convertHundreds(n, useAnd = false) {
    let result = '';

    const hundred = Math.floor(n / 100);
    const remainder = n % 100;

    if (hundred > 0) {
      result += ones[hundred] + ' hundred';
      if (remainder > 0) {
        result += ' and ';
      }
    } else if (useAnd && remainder > 0) {
      // Add 'and' before the last group if it's less than 100
      result += 'and ';
    }

    if (remainder >= 10 && remainder < 20) {
      result += teens[remainder - 10];
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;

      if (ten > 0) {
        result += tens[ten];
        if (one > 0) result += ' ';
      }

      if (one > 0) {
        result += ones[one];
      }
    }

    return result;
  }

  // Convert to BigInt to handle large numbers
  let bigNum = BigInt(absNum);
  let result = '';
  let hasLargeScale = false;

  // Process each scale (quintillion down to thousand)
  for (const scale of scales) {
    if (bigNum >= scale.value) {
      const scaleAmount = bigNum / scale.value;
      result += convertHundreds(Number(scaleAmount)) + ' ' + scale.name + ', ';
      bigNum = bigNum % scale.value;
      hasLargeScale = true;
    }
  }

  // Process remaining hundreds
  if (bigNum > 0n) {
    result += convertHundreds(Number(bigNum), hasLargeScale);
  }

  // Clean up trailing comma and extra spaces
  result = result.trim().replace(/\s+/g, ' ');
  if (result.endsWith(',')) {
    result = result.slice(0, -1).trim();
  }

  // Add 'minus' prefix if needed
  if (isNegative) {
    result = 'minus ' + result;
  }

  return result;
}
