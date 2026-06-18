require('dotenv').config();
const pool = require('./config/db');

const problems = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.\n\nInput Format:\nFirst line: space-separated integers (the array)\nSecond line: target integer\n\nOutput Format:\nTwo space-separated indices (0-based)',
    difficulty: 'easy',
    tags: ['Array', 'Hash Table'],
    examples: JSON.stringify([
      { input: '2 7 11 15\n9', expected_output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: '3 2 4\n6', expected_output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' }
    ]),
    test_cases: JSON.stringify([
      { input: '2 7 11 15\n9', expected_output: '0 1' },
      { input: '3 2 4\n6', expected_output: '1 2' },
      { input: '3 3\n6', expected_output: '0 1' },
      { input: '1 2 3 4 5\n9', expected_output: '3 4' },
      { input: '-1 -2 -3 -4 -5\n-8', expected_output: '2 4' }
    ])
  },
  {
    title: 'Reverse Integer',
    description: 'Given a signed integer x, return x with its digits reversed. If reversing causes the value to go outside the 32-bit signed integer range, return 0.\n\nInput Format:\nA single integer\n\nOutput Format:\nThe reversed integer',
    difficulty: 'easy',
    tags: ['Math'],
    examples: JSON.stringify([
      { input: '123', expected_output: '321', explanation: 'Reverse digits of 123' },
      { input: '-456', expected_output: '-654', explanation: 'Sign is preserved' }
    ]),
    test_cases: JSON.stringify([
      { input: '123', expected_output: '321' },
      { input: '-456', expected_output: '-654' },
      { input: '120', expected_output: '21' },
      { input: '0', expected_output: '0' },
      { input: '1534236469', expected_output: '0' }
    ])
  },
  {
    title: 'Valid Palindrome',
    description: 'Given a string s, determine if it is a palindrome, considering only alphanumeric characters and ignoring case.\n\nInput Format:\nA single line string\n\nOutput Format:\nPrint "true" or "false"',
    difficulty: 'easy',
    tags: ['String', 'Two Pointers'],
    examples: JSON.stringify([
      { input: 'A man, a plan, a canal: Panama', expected_output: 'true', explanation: 'Cleaned string is a palindrome' },
      { input: 'race a car', expected_output: 'false', explanation: 'Not a palindrome' }
    ]),
    test_cases: JSON.stringify([
      { input: 'A man, a plan, a canal: Panama', expected_output: 'true' },
      { input: 'race a car', expected_output: 'false' },
      { input: '', expected_output: 'true' },
      { input: '0P', expected_output: 'false' },
      { input: 'Was it a car or a cat I saw?', expected_output: 'true' }
    ])
  },
  {
    title: 'FizzBuzz',
    description: 'Given an integer n, print numbers from 1 to n, each on a new line. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz", otherwise print the number itself.\n\nInput Format:\nA single integer n\n\nOutput Format:\nn lines, one value per line',
    difficulty: 'easy',
    tags: ['Math'],
    examples: JSON.stringify([
      { input: '5', expected_output: '1\n2\nFizz\n4\nBuzz', explanation: '3 -> Fizz, 5 -> Buzz' }
    ]),
    test_cases: JSON.stringify([
      { input: '5', expected_output: '1\n2\nFizz\n4\nBuzz' },
      { input: '15', expected_output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' },
      { input: '1', expected_output: '1' },
      { input: '3', expected_output: '1\n2\nFizz' },
      { input: '10', expected_output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz' }
    ])
  },
  {
    title: 'Maximum Subarray Sum',
    description: 'Given an integer array, find the contiguous subarray with the largest sum and return that sum (Kadane\'s Algorithm).\n\nInput Format:\nSpace-separated integers\n\nOutput Format:\nA single integer — the maximum sum',
    difficulty: 'medium',
    tags: ['Array', 'Dynamic Programming'],
    examples: JSON.stringify([
      { input: '-2 1 -3 4 -1 2 1 -5 4', expected_output: '6', explanation: '[4,-1,2,1] has the largest sum = 6' }
    ]),
    test_cases: JSON.stringify([
      { input: '-2 1 -3 4 -1 2 1 -5 4', expected_output: '6' },
      { input: '1', expected_output: '1' },
      { input: '5 4 -1 7 8', expected_output: '23' },
      { input: '-1 -2 -3', expected_output: '-1' },
      { input: '0 0 0 0', expected_output: '0' }
    ])
  },
  {
    title: 'Binary Search',
    description: 'Given a sorted array of integers and a target value, return the index of target if found, otherwise return -1. Implement an O(log n) binary search.\n\nInput Format:\nFirst line: space-separated sorted integers\nSecond line: target integer\n\nOutput Format:\nThe index (0-based), or -1 if not found',
    difficulty: 'medium',
    tags: ['Array', 'Binary Search'],
    examples: JSON.stringify([
      { input: '-1 0 3 5 9 12\n9', expected_output: '4', explanation: '9 is at index 4' }
    ]),
    test_cases: JSON.stringify([
      { input: '-1 0 3 5 9 12\n9', expected_output: '4' },
      { input: '-1 0 3 5 9 12\n2', expected_output: '-1' },
      { input: '5\n5', expected_output: '0' },
      { input: '1 2 3 4 5 6 7 8 9 10\n10', expected_output: '9' },
      { input: '2 4 6 8 10\n2', expected_output: '0' }
    ])
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string containing just the characters (, ), {, }, [ and ], determine if the input string has valid matching and nesting of brackets.\n\nInput Format:\nA single line string\n\nOutput Format:\nPrint "true" or "false"',
    difficulty: 'easy',
    tags: ['String', 'Stack'],
    examples: JSON.stringify([
      { input: '()[]{}', expected_output: 'true', explanation: 'All brackets matched correctly' },
      { input: '(]', expected_output: 'false', explanation: 'Mismatched bracket types' }
    ]),
    test_cases: JSON.stringify([
      { input: '()[]{}', expected_output: 'true' },
      { input: '(]', expected_output: 'false' },
      { input: '()', expected_output: 'true' },
      { input: '([)]', expected_output: 'false' },
      { input: '{[]}', expected_output: 'true' }
    ])
  }
];

async function seed() {
  try {
    console.log('Seeding coding problems...');
    for (const p of problems) {
      await pool.query(
        'INSERT INTO coding_problems (title, description, difficulty, tags, examples, test_cases) VALUES ($1, $2, $3, $4, $5, $6)',
        [p.title, p.description, p.difficulty, p.tags, p.examples, p.test_cases]
      );
    }
    console.log(`✅ Seeded ${problems.length} coding problems!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();