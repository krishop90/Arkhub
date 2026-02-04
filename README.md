# EnergyGrid Data Aggregator

## Technical Approach: The Leaky Bucket

So basically what I did is I followed the **Leaky Bucket Approach**.

### What is Leaky Bucket?
If I want to explain it simply: think of a bucket with a small hole at the bottom that drips water at a constant rate (1 drop per second).

**In my code:**
- **The Water:** Incoming API requests.
- **The Overflow:** HTTP 429 Errors (Rate Limit Exceeded).
- **The Goal:** Pour water into the bucket only as fast as it drips out, ensuring it never overflows.

### Implementation
Instead of dumping all 500 requests at once (which would cause an overflow/429), my code controls the flow manually:

- **The Timer:** Before sending a batch, I start a timer.
- **The Request:** I send the batch of 10 items.
- **The "Drip" Calculation:** After the request finishes, I calculate how much time has passed.
- **Constraint:** 1 request per 1000ms.
- **Safety Buffer:** I use 1100ms to account for network jitter.
- **The Control Valve:** If the request took 200ms, the code forces a sleep for the remaining 900ms.

---

## 🛠️ How to Run

### 1. Setup
Clone this directory to your local machine and navigate into the project folder.

### 2. Install Dependencies
Run the following command to install the required packages (Axios):
```bash
cd assignment
npm install
```

### 3. Execution (Requires 2 Terminals)
You need to run the mock server and the aggregator script simultaneously.

Terminal 1: Start the Server Navigate to the mock-api folder and start the server:
```bash
cd assignment
node server.js
```
(Keep this terminal open. You should see "EnergyGrid Mock API running...")

Terminal 2: Run the Aggregator Navigate to the root folder (energy-aggregator) and run the main script:
```bash
cd assignment
node index.js
```

### 4. Output
The script will display real-time progress in the terminal.
Once complete, the full list of data will be saved to a file named results.json


### HOW TO CHECK THAT Break works ? 

- Since the code perfectly respects the rate limit by default, you won't see errors during a normal run. To verify that the retry logic (robustness) actually works:

1. Open config.js.
2. Change RATE_LIMIT_MS from 1100 to 100. (This makes the client send requests too fast).
3. Run node index.js.
4. Result: You will see the script catch the error and auto-retry:
    - [!] Rate Limit Hit. Retrying in 2s...
