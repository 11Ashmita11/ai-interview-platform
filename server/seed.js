const pool = require('./config/db');
require('dotenv').config();

const questions = [
  // ── DSA ──────────────────────────────────────────────
  {
    topic: 'DSA',
    difficulty: 'easy',
    text: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correct_index: 1,
  },
  {
    topic: 'DSA',
    difficulty: 'easy',
    text: 'Which data structure uses LIFO order?',
    options: ['Queue', 'Stack', 'Linked List', 'Tree'],
    correct_index: 1,
  },
  {
    topic: 'DSA',
    difficulty: 'easy',
    text: 'What is the worst-case time complexity of bubble sort?',
    options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    correct_index: 2,
  },
  {
    topic: 'DSA',
    difficulty: 'medium',
    text: 'Which traversal of a BST gives elements in sorted order?',
    options: ['Preorder', 'Postorder', 'Inorder', 'Level order'],
    correct_index: 2,
  },
  {
    topic: 'DSA',
    difficulty: 'medium',
    text: 'What is the time complexity of inserting into a hash table on average?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
    correct_index: 2,
  },
  {
    topic: 'DSA',
    difficulty: 'medium',
    text: 'Which algorithm is used to find the shortest path in an unweighted graph?',
    options: ['DFS', 'BFS', 'Dijkstra', 'Bellman-Ford'],
    correct_index: 1,
  },
  {
    topic: 'DSA',
    difficulty: 'medium',
    text: 'What data structure is used internally by a recursive function call?',
    options: ['Queue', 'Heap', 'Stack', 'Array'],
    correct_index: 2,
  },
  {
    topic: 'DSA',
    difficulty: 'hard',
    text: 'What is the time complexity of building a heap from an array of n elements?',
    options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n²)'],
    correct_index: 1,
  },
  {
    topic: 'DSA',
    difficulty: 'hard',
    text: 'In a min-heap, which element is always at the root?',
    options: ['Maximum element', 'Median element', 'Minimum element', 'Last inserted element'],
    correct_index: 2,
  },
  {
    topic: 'DSA',
    difficulty: 'hard',
    text: 'What is the space complexity of merge sort?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correct_index: 2,
  },

  // ── OS ───────────────────────────────────────────────
  {
    topic: 'OS',
    difficulty: 'easy',
    text: 'What does CPU stand for?',
    options: ['Central Processing Unit', 'Core Processing Unit', 'Central Program Unit', 'Computing Process Unit'],
    correct_index: 0,
  },
  {
    topic: 'OS',
    difficulty: 'easy',
    text: 'Which scheduling algorithm can cause starvation?',
    options: ['Round Robin', 'FCFS', 'Priority Scheduling', 'SJF'],
    correct_index: 2,
  },
  {
    topic: 'OS',
    difficulty: 'easy',
    text: 'What is a deadlock?',
    options: [
      'A process that runs forever',
      'A situation where two or more processes wait for each other indefinitely',
      'A memory overflow error',
      'A CPU scheduling conflict',
    ],
    correct_index: 1,
  },
  {
    topic: 'OS',
    difficulty: 'medium',
    text: 'Which of the following is NOT a condition for deadlock?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption', 'Circular Wait'],
    correct_index: 2,
  },
  {
    topic: 'OS',
    difficulty: 'medium',
    text: 'What is virtual memory?',
    options: [
      'RAM that is hidden from the OS',
      'A technique that uses disk space to extend RAM',
      'Cache memory on the CPU',
      'Memory used only by the kernel',
    ],
    correct_index: 1,
  },
  {
    topic: 'OS',
    difficulty: 'medium',
    text: 'Which page replacement algorithm suffers from Belady\'s anomaly?',
    options: ['LRU', 'Optimal', 'FIFO', 'LFU'],
    correct_index: 2,
  },
  {
    topic: 'OS',
    difficulty: 'medium',
    text: 'What is a semaphore used for?',
    options: ['Memory management', 'Process synchronization', 'CPU scheduling', 'File I/O'],
    correct_index: 1,
  },
  {
    topic: 'OS',
    difficulty: 'hard',
    text: 'In which CPU scheduling algorithm does the OS switch processes after a fixed time slice?',
    options: ['FCFS', 'SJF', 'Round Robin', 'Priority'],
    correct_index: 2,
  },
  {
    topic: 'OS',
    difficulty: 'hard',
    text: 'What is thrashing in operating systems?',
    options: [
      'Excessive CPU usage',
      'A state where the OS spends more time swapping pages than executing processes',
      'A process that consumes all memory',
      'Frequent context switching',
    ],
    correct_index: 1,
  },
  {
    topic: 'OS',
    difficulty: 'hard',
    text: 'Which of the following is an example of a non-preemptive scheduling algorithm?',
    options: ['Round Robin', 'SRTF', 'FCFS', 'Priority (preemptive)'],
    correct_index: 2,
  },

  // ── DBMS ─────────────────────────────────────────────
  {
    topic: 'DBMS',
    difficulty: 'easy',
    text: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Query Language', 'Sequential Query Logic', 'Structured Queue Language'],
    correct_index: 0,
  },
  {
    topic: 'DBMS',
    difficulty: 'easy',
    text: 'Which SQL command is used to retrieve data from a table?',
    options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'],
    correct_index: 2,
  },
  {
    topic: 'DBMS',
    difficulty: 'easy',
    text: 'What is a primary key?',
    options: [
      'A key that can have duplicate values',
      'A key that uniquely identifies each row in a table',
      'A key that references another table',
      'A key used only for indexing',
    ],
    correct_index: 1,
  },
  {
    topic: 'DBMS',
    difficulty: 'medium',
    text: 'What is a foreign key?',
    options: [
      'A key from another database',
      'A key that uniquely identifies a row',
      'A key that references the primary key of another table',
      'A composite key',
    ],
    correct_index: 2,
  },
  {
    topic: 'DBMS',
    difficulty: 'medium',
    text: 'Which normal form eliminates transitive dependencies?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    correct_index: 2,
  },
  {
    topic: 'DBMS',
    difficulty: 'medium',
    text: 'What does ACID stand for in database transactions?',
    options: [
      'Atomicity, Consistency, Isolation, Durability',
      'Availability, Consistency, Integrity, Durability',
      'Atomicity, Concurrency, Isolation, Distribution',
      'Accuracy, Consistency, Isolation, Durability',
    ],
    correct_index: 0,
  },
  {
    topic: 'DBMS',
    difficulty: 'medium',
    text: 'Which JOIN returns all rows from both tables, with NULLs where there is no match?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
    correct_index: 3,
  },
  {
    topic: 'DBMS',
    difficulty: 'hard',
    text: 'What is the difference between DELETE and TRUNCATE in SQL?',
    options: [
      'No difference',
      'DELETE removes the table; TRUNCATE removes rows',
      'DELETE can have a WHERE clause and is logged; TRUNCATE removes all rows faster and cannot be rolled back in most DBs',
      'TRUNCATE can have a WHERE clause; DELETE cannot',
    ],
    correct_index: 2,
  },
  {
    topic: 'DBMS',
    difficulty: 'hard',
    text: 'What is a deadlock in the context of databases?',
    options: [
      'A query that runs too long',
      'Two transactions waiting on each other\'s locked resources indefinitely',
      'A corrupted index',
      'A failed transaction rollback',
    ],
    correct_index: 1,
  },
  {
    topic: 'DBMS',
    difficulty: 'hard',
    text: 'Which index type is best for range queries?',
    options: ['Hash Index', 'B-Tree Index', 'Bitmap Index', 'Full-text Index'],
    correct_index: 1,
  },
];

async function seed() {
  try {
    console.log('Seeding questions...');
    for (const q of questions) {
      await pool.query(
        `INSERT INTO questions (topic, difficulty, text, options, correct_index)
         VALUES ($1, $2, $3, $4, $5)`,
        [q.topic, q.difficulty, q.text, q.options, q.correct_index]
      );
    }
    console.log(`✅ Seeded ${questions.length} questions successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();