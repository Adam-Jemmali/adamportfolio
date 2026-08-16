// Dev quiz bank. Questions are grouped by category so players can drill into
// system design, full stack, general coding, or the web. The deck is shuffled
// per run so every attempt feels fresh.
export const QUIZ_CATEGORIES = [
    { id: "system-design", label: "System Design" },
    { id: "full-stack", label: "Full Stack" },
    { id: "coding", label: "Coding" },
    { id: "web", label: "Web & Internet" },
];

export const POP_QUIZ = [
    // ---- System Design ----
    {
        category: "system-design",
        question: "Which pattern stops repeated calls to a failing dependency to prevent cascading failures?",
        options: ["Circuit breaker", "Observer", "Singleton", "Factory"],
        answer: 0,
    },
    {
        category: "system-design",
        question: "What is the main job of a load balancer?",
        options: [
            "Distributes traffic across multiple servers",
            "Encrypts database queries",
            "Compiles source code",
            "Caches DNS records",
        ],
        answer: 0,
    },
    {
        category: "system-design",
        question: "Which cache eviction policy removes the item that hasn't been used for the longest time?",
        options: ["LRU", "FIFO", "MRU", "LFU"],
        answer: 0,
    },
    {
        category: "system-design",
        question: "Which popular in-memory store is commonly used for caching and pub/sub?",
        options: ["Redis", "PostgreSQL", "SQLite", "Elasticsearch"],
        answer: 0,
    },
    {
        category: "system-design",
        question: "What does horizontal scaling mean?",
        options: [
            "Adding more machines to share the load",
            "Upgrading one machine's CPU and RAM",
            "Splitting a monolith into folders",
            "Rewriting a service in a faster language",
        ],
        answer: 0,
    },
    {
        category: "system-design",
        question: "Where do messages go when a queue can't deliver or process them after all retries?",
        options: ["Dead-letter queue", "Trash topic", "Null stream", "Overflow bucket"],
        answer: 0,
    },

    // ---- Full Stack ----
    {
        category: "full-stack",
        question: "What does REST stand for?",
        options: [
            "Representational State Transfer",
            "Remote Execution Service Toolkit",
            "Relational Entity Storage Type",
            "Rapid Endpoint Scaling Transport",
        ],
        answer: 0,
    },
    {
        category: "full-stack",
        question: "Which HTTP method is idempotent and used to fully replace a resource?",
        options: ["PUT", "POST", "PATCH", "DELETE"],
        answer: 0,
    },
    {
        category: "full-stack",
        question: "Which HTTP header tells the client the format of the response body?",
        options: ["Content-Type", "Accept-Encoding", "User-Agent", "Cache-Control"],
        answer: 0,
    },
    {
        category: "full-stack",
        question: "Which HTTP status code means a resource was successfully created?",
        options: ["201", "204", "301", "418"],
        answer: 0,
    },
    {
        category: "full-stack",
        question: "What is a JSON Web Token (JWT)?",
        options: [
            "A signed token carrying claims",
            "A database index type",
            "A CSS layout mode",
            "A TLS certificate format",
        ],
        answer: 0,
    },
    {
        category: "full-stack",
        question: "Which protocol upgrades HTTP into a full-duplex, real-time connection?",
        options: ["WebSockets", "SMTP", "FTP", "GraphQL"],
        answer: 0,
    },

    // ---- General Coding ----
    {
        category: "coding",
        question: "What is the time complexity of binary search on a sorted array?",
        options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
        answer: 0,
    },
    {
        category: "coding",
        question: "Which data structure follows Last-In-First-Out (LIFO) order?",
        options: ["Stack", "Queue", "Heap", "Linked list"],
        answer: 0,
    },
    {
        category: "coding",
        question: "In JavaScript, which keyword declares a variable that can't be reassigned?",
        options: ["const", "let", "var", "static"],
        answer: 0,
    },
    {
        category: "coding",
        question: "What does the DRY principle stand for?",
        options: [
            "Don't Repeat Yourself",
            "Do Repeat Yourself",
            "Delete Rarely Used code",
            "Debug Recursively, Yep",
        ],
        answer: 0,
    },
    {
        category: "coding",
        question: "Which Git command records the staged changes into history?",
        options: ["git commit", "git add", "git push", "git stash"],
        answer: 0,
    },
    {
        category: "coding",
        question: "What is a pure function?",
        options: [
            "Same inputs always produce the same output, with no side effects",
            "A function that only uses global state",
            "A function written in a single file",
            "A function that returns a random value",
        ],
        answer: 0,
    },

    // ---- Web & Internet ----
    {
        category: "web",
        question: "What does DNS do?",
        options: [
            "Translates domain names into IP addresses",
            "Encrypts web traffic",
            "Serves HTML files",
            "Balances server load",
        ],
        answer: 0,
    },
    {
        category: "web",
        question: "Which HTTP status code means the resource was not found?",
        options: ["404", "500", "200", "401"],
        answer: 0,
    },
    {
        category: "web",
        question: "What does HTTPS add on top of HTTP?",
        options: ["Encryption via TLS", "Faster downloads", "Cookies by default", "Server-side rendering"],
        answer: 0,
    },
    {
        category: "web",
        question: "Which HTTP method is typically used to send data to create a resource?",
        options: ["POST", "GET", "HEAD", "OPTIONS"],
        answer: 0,
    },
    {
        category: "web",
        question: "What does CORS stand for?",
        options: [
            "Cross-Origin Resource Sharing",
            "Client-Only Request Script",
            "Common Origin Routing System",
            "Content Origin Rate Setup",
        ],
        answer: 0,
    },
    {
        category: "web",
        question: "What is a browser cookie?",
        options: [
            "Small data the browser stores and sends with requests",
            "A cached copy of a page",
            "A JavaScript module",
            "A DNS record type",
        ],
        answer: 0,
    },
];

export const shuffleDeck = (items) => {
    const deck = [...items];
    for (let i = deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

export const quizPool = (category) =>
    category === "all" ? POP_QUIZ : POP_QUIZ.filter((q) => q.category === category);
